#!/usr/bin/env python3
"""Build browser-safe route data from the configured AMap MCP server."""

from __future__ import annotations

import json
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CONFIG = Path.home() / ".codex" / "config.toml"
OUTPUT = ROOT / "amap-route-data.js"
CACHE = ROOT / ".amap-route-cache.json"
STATIC_MAP = ROOT / "amap-static-route.png"

POINTS = {
    "hotel": ("如家NEO酒店 乌鲁木齐黄河路中医院和田二街店", "乌鲁木齐"),
    "baili": ("S101百里丹霞丽景", "乌鲁木齐"),
    "kensiwate": ("肯斯瓦特水库", "石河子"),
    "anjihai": ("安集海大峡谷", "塔城"),
    "kuitun": ("奎屯市人民政府", "奎屯"),
    "duku": ("独库公路起点", "克拉玛依"),
    "qiaoerma": ("乔尔玛革命烈士陵园", "伊犁"),
    "tangbula": ("唐布拉国家森林公园", "伊犁"),
    "mengket": ("唐布拉孟克特旅游景区", "伊犁"),
    "xinyuan": ("新源县人民政府", "伊犁"),
    "kuerdening": ("库尔德宁景区", "伊犁"),
    "kalajun": ("喀拉峻国际生态旅游区", "伊犁"),
    "tekesi": ("特克斯县人民政府", "伊犁"),
    "xiata": ("夏塔旅游景区", "伊犁"),
    "zhaosu": ("昭苏县人民政府", "伊犁"),
    "yining": ("伊宁市人民政府", "伊犁"),
    "sayram": ("赛里木湖景区东门", "博尔塔拉"),
    "jinghe": ("精河县人民政府", "博尔塔拉"),
    "airport": ("乌鲁木齐天山国际机场", "乌鲁木齐"),
}

DAYS = [
    ("D2", "乌鲁木齐至奎屯", ["hotel", "baili", "kensiwate", "anjihai", "kuitun"]),
    ("D3", "独库北段与孟克特", ["kuitun", "duku", "qiaoerma", "tangbula", "mengket", "xinyuan"]),
    ("D4", "新源至库尔德宁", ["xinyuan", "kuerdening"]),
    ("D5", "库尔德宁至特克斯", ["kuerdening", "kalajun", "tekesi"]),
    ("D6", "特克斯至昭苏", ["tekesi", "xiata", "zhaosu"]),
    ("D7", "伊昭公路至伊宁", ["zhaosu", "yining"]),
    ("D8", "赛里木湖环湖日", ["yining", "sayram", "jinghe"]),
    ("D9", "精河返程", ["jinghe", "airport"]),
]


def mcp_url() -> str:
    text = CONFIG.read_text()
    match = re.search(
        r"\[mcp_servers\.amap-maps-streamableHTTP\]\s+url\s*=\s*\"([^\"]+)\"",
        text,
    )
    if not match:
        raise RuntimeError("AMap MCP is not configured in ~/.codex/config.toml")
    return match.group(1)


def web_service_key(url: str) -> str:
    query = urllib.parse.parse_qs(urllib.parse.urlsplit(url).query)
    keys = query.get("key")
    if not keys:
        raise RuntimeError("No AMap key found in the configured MCP URL")
    return keys[0]


def driving_polyline(key: str, start: dict, end: dict) -> dict:
    params = urllib.parse.urlencode(
        {
            "origin": f"{start['lon']},{start['lat']}",
            "destination": f"{end['lon']},{end['lat']}",
            "extensions": "base",
            "strategy": "0",
            "key": key,
        }
    )
    request = urllib.request.Request(
        f"https://restapi.amap.com/v3/direction/driving?{params}",
        headers={"User-Agent": "Xinjiang-route-builder/1.0"},
    )
    result = None
    for attempt in range(5):
        with urllib.request.urlopen(request, timeout=30) as response:
            result = json.load(response)
        if result.get("status") == "1" and result.get("route", {}).get("paths"):
            break
        if "EXCEEDED_THE_LIMIT" not in result.get("info", ""):
            raise RuntimeError(f"AMap Web driving failed: {result.get('info')}")
        time.sleep(2 ** attempt)
    if result is None or result.get("status") != "1" or not result.get("route", {}).get("paths"):
        raise RuntimeError(f"AMap Web driving failed: {result.get('info') if result else 'no response'}")
    path = result["route"]["paths"][0]
    points = []
    for step in path.get("steps", []):
        for raw in step.get("polyline", "").split(";"):
            if not raw:
                continue
            lon, lat = (float(value) for value in raw.split(","))
            point = [lon, lat]
            if not points or points[-1] != point:
                points.append(point)
    time.sleep(0.45)
    return {
        "distanceKm": round(int(path["distance"]) / 1000, 1),
        "durationMinutes": round(int(path["duration"]) / 60),
        "polyline": points,
    }


def sample_points(points: list[list[float]], limit: int = 85) -> list[list[float]]:
    if len(points) <= limit:
        return points
    step = (len(points) - 1) / (limit - 1)
    indexes = [round(index * step) for index in range(limit)]
    return [points[index] for index in indexes]


def generate_static_map(key: str, days: list[dict], points: dict) -> None:
    groups = [
        (["D2", "D3"], "0xbf5945"),
        (["D4", "D5"], "0x167b75"),
        (["D6", "D7"], "0x765f87"),
        (["D8", "D9"], "0x3974a8"),
    ]
    path_values = []
    for day_names, color in groups:
        group_points = []
        for day in days:
            if day["day"] not in day_names:
                continue
            for leg in day["legs"]:
                route = leg.get("webRoute", {})
                if route.get("status") == "real-road" and route.get("polyline"):
                    leg_points = route["polyline"]
                else:
                    start = points[leg["from"]]
                    end = points[leg["to"]]
                    leg_points = [[start["lon"], start["lat"]], [end["lon"], end["lat"]]]
                if group_points and leg_points and group_points[-1] == leg_points[0]:
                    group_points.extend(leg_points[1:])
                else:
                    group_points.extend(leg_points)
        sampled = sample_points(group_points)
        locations = ";".join(f"{lon:.6f},{lat:.6f}" for lon, lat in sampled)
        path_values.append(f"6,{color},0.9,,:{locations}")

    marker_keys = ["hotel", "kuitun", "xinyuan", "kuerdening", "tekesi", "zhaosu", "yining", "jinghe", "airport"]
    marker_locations = ";".join(
        f"{points[name]['lon']:.6f},{points[name]['lat']:.6f}" for name in marker_keys
    )
    params = urllib.parse.urlencode(
        {
            "size": "1024*720",
            "scale": "1",
            "traffic": "0",
            "paths": "|".join(path_values),
            "markers": f"mid,0xf4c15d,住:{marker_locations}",
            "key": key,
        },
        safe=":;,|*",
    )
    request = urllib.request.Request(
        f"https://restapi.amap.com/v3/staticmap?{params}",
        headers={"User-Agent": "Xinjiang-route-builder/1.0"},
    )
    with urllib.request.urlopen(request, timeout=45) as response:
        content_type = response.headers.get("Content-Type", "")
        body = response.read()
    if not content_type.startswith("image/"):
        raise RuntimeError(f"AMap static map failed: {body[:300]!r}")
    STATIC_MAP.write_bytes(body)


def call_tool(url: str, name: str, arguments: dict, request_id: int) -> dict:
    payload = json.dumps(
        {
            "jsonrpc": "2.0",
            "id": request_id,
            "method": "tools/call",
            "params": {"name": name, "arguments": arguments},
        }
    ).encode()
    request = urllib.request.Request(
        url,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Accept": "application/json, text/event-stream",
        },
    )
    result = None
    for attempt in range(5):
        with urllib.request.urlopen(request, timeout=30) as response:
            result = json.load(response)
        if not result.get("result", {}).get("isError"):
            break
        message = result["result"]["content"][0].get("text", "")
        if "EXCEEDED_THE_LIMIT" not in message:
            raise RuntimeError(f"{name} failed: {message}")
        time.sleep(2 ** attempt)
    if result is None or result.get("result", {}).get("isError"):
        message = result["result"]["content"][0].get("text", "") if result else "no response"
        raise RuntimeError(f"{name} failed after retries: {message}")
    text = result["result"]["content"][0]["text"]
    time.sleep(0.35)
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return {"uri": text}


def resolve_point(url: str, key: str, query: str, city: str, request_id: int) -> dict:
    search = call_tool(
        url,
        "maps_text_search",
        {"keywords": query, "city": city, "citylimit": False},
        request_id,
    )
    pois = search.get("pois", [])
    if not pois:
        raise RuntimeError(f"No AMap POI found for {query}")
    poi = pois[0]
    detail = call_tool(url, "maps_search_detail", {"id": poi["id"]}, request_id + 1)
    location = detail.get("location")
    if not location:
        geo = call_tool(url, "maps_geo", {"address": query, "city": city}, request_id + 2)
        location = geo["results"][0]["location"]
    lon, lat = (float(value) for value in location.split(","))
    return {
        "key": key,
        "name": poi.get("name") or query,
        "query": query,
        "poiId": poi["id"],
        "lon": lon,
        "lat": lat,
        "address": detail.get("address") or poi.get("address") or "",
    }


def main() -> None:
    url = mcp_url()
    web_key = web_service_key(url)
    if CACHE.exists():
        cache = json.loads(CACHE.read_text())
    else:
        cache = {"points": {}, "routes": {}}
    resolved = cache["points"]
    request_id = 100
    for key, (query, city) in POINTS.items():
        if key not in resolved:
            resolved[key] = resolve_point(url, key, query, city, request_id)
            CACHE.write_text(json.dumps(cache, ensure_ascii=False, indent=2))
        request_id += 10

    days = []
    for day, title, point_keys in DAYS:
        legs = []
        for start_key, end_key in zip(point_keys, point_keys[1:]):
            start = resolved[start_key]
            end = resolved[end_key]
            route_key = f"{start_key}:{end_key}"
            if route_key not in cache["routes"]:
                route = call_tool(
                    url,
                    "maps_direction_driving",
                    {
                        "origin": f"{start['lon']},{start['lat']}",
                        "destination": f"{end['lon']},{end['lat']}",
                    },
                    request_id,
                )
                request_id += 1
                path = route["paths"][0]
                cache["routes"][route_key] = {
                    "distanceKm": round(int(path["distance"]) / 1000, 1),
                    "durationMinutes": round(int(path["duration"]) / 60),
                }
                CACHE.write_text(json.dumps(cache, ensure_ascii=False, indent=2))
            route_result = cache["routes"][route_key]
            if route_result.get("webRoute", {}).get("status") in (None, "unavailable"):
                try:
                    web_route = driving_polyline(web_key, start, end)
                    ratio = web_route["distanceKm"] / max(route_result["distanceKm"], 1)
                    if ratio <= 2.2:
                        route_result["webRoute"] = {
                            **web_route,
                            "status": "real-road",
                        }
                    else:
                        route_result["webRoute"] = {
                            "status": "current-closure-detour",
                            "distanceKm": web_route["distanceKm"],
                            "durationMinutes": web_route["durationMinutes"],
                            "polyline": [],
                        }
                except RuntimeError as error:
                    route_result["webRoute"] = {
                        "status": "unavailable",
                        "message": str(error),
                        "polyline": [],
                    }
                CACHE.write_text(json.dumps(cache, ensure_ascii=False, indent=2))
            legs.append(
                {
                    "from": start_key,
                    "to": end_key,
                    **route_result,
                }
            )
        days.append({"day": day, "title": title, "points": point_keys, "legs": legs})

    line_list = []
    for day in days:
        line_list.append(
            {
                "title": f"{day['day']} {day['title']}",
                "pointInfoList": [
                    {
                        "name": resolved[key]["name"],
                        "lon": resolved[key]["lon"],
                        "lat": resolved[key]["lat"],
                        "poiId": resolved[key]["poiId"],
                    }
                    for key in day["points"]
                ],
            }
        )

    try:
        schema = call_tool(
            url,
            "maps_schema_personal_map",
            {"orgName": "新疆伊犁环线Plan A", "lineList": line_list},
            request_id,
        )
        personal_map_uri = (
            schema.get("uri")
            or schema.get("url")
            or schema.get("schema")
            or schema.get("link")
            or ""
        )
    except RuntimeError as error:
        print(f"Personal map link skipped: {error}")
        personal_map_uri = ""

    data = {
        "generatedAt": __import__("datetime").datetime.now().isoformat(timespec="seconds"),
        "source": "AMap MCP",
        "points": resolved,
        "days": days,
        "personalMapUri": personal_map_uri,
    }
    OUTPUT.write_text(
        "window.AMAP_ROUTE_DATA = "
        + json.dumps(data, ensure_ascii=False, separators=(",", ":"))
        + ";\n"
    )
    generate_static_map(web_key, days, resolved)
    print(f"Generated {OUTPUT.name}: {len(resolved)} points, {sum(len(d['legs']) for d in days)} legs")


if __name__ == "__main__":
    main()
