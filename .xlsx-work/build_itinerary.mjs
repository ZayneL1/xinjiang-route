import fs from "node:fs/promises";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir = "/Users/zayne/Dev/Xinjiang/outputs/xinjiang_itinerary";
await fs.mkdir(outputDir, { recursive: true });

const wb = Workbook.create();
wb.comments.setSelf({ displayName: "Zayne" });

const colors = {
  ink: "#20313A",
  muted: "#69757D",
  paper: "#FFFDF8",
  teal: "#167B75",
  tealSoft: "#E7F3EF",
  blue: "#3974A8",
  green: "#5E8247",
  greenSoft: "#EAF1E5",
  amber: "#BD7624",
  amberSoft: "#FFF0DE",
  coral: "#BF5945",
  coralSoft: "#FBE9E5",
  plum: "#765F87",
  line: "#D9D2C4",
  dark: "#22313A",
  white: "#FFFFFF"
};

const border = { preset: "insideHorizontal", style: "thin", color: colors.line };
const headerFormat = {
  fill: colors.dark,
  font: { bold: true, color: colors.white },
  verticalAlignment: "center",
  horizontalAlignment: "center",
  wrapText: true
};
const titleFormat = {
  fill: colors.teal,
  font: { bold: true, color: colors.white, size: 18 },
  verticalAlignment: "center",
  horizontalAlignment: "left"
};
const subtitleFormat = {
  fill: colors.tealSoft,
  font: { color: colors.ink, italic: true },
  verticalAlignment: "center",
  wrapText: true
};

function styleTitle(sheet, title, subtitle, endCol) {
  sheet.mergeCells(`A1:${endCol}1`);
  sheet.getRange("A1").values = [[title]];
  sheet.getRange(`A1:${endCol}1`).format = titleFormat;
  sheet.getRange("A1").format.rowHeight = 34;
  sheet.mergeCells(`A2:${endCol}2`);
  sheet.getRange("A2").values = [[subtitle]];
  sheet.getRange(`A2:${endCol}2`).format = subtitleFormat;
  sheet.getRange("A2").format.rowHeight = 34;
  sheet.showGridLines = false;
}

function styleTable(sheet, headerRange, bodyRange) {
  sheet.getRange(headerRange).format = headerFormat;
  sheet.getRange(bodyRange).format = {
    verticalAlignment: "top",
    wrapText: true,
    borders: border
  };
}

const planRows = [
  ["Plan A", "当前主方案", "独库北段、伊昭公路正常开放且预约成功", "乌鲁木齐 → S101 → 安集海 → 奎屯 → 独库 → 孟克特 → 新源 → 库尔德宁 → 喀拉峻 → 特克斯 → 夏塔 → 昭苏 → 伊宁 → 赛里木湖 → 精河 → 乌鲁木齐", "约2,200公里", "9天", "已规划"],
  ["Plan B", "独库封路绕行", "7月13日独库北段封闭、未预约成功或山口天气不适合通行", "待规划：建议保留伊犁核心景点，经高速/国道绕行进入伊犁", "待计算", "9天", "待完善"],
  ["Plan C", "极端天气保守方案", "独库与伊昭同时受限、连续降雨或多个山地景区关闭", "待规划：减少山地景区，增加伊宁、赛里木湖及城市/低海拔节点", "待计算", "9天", "待完善"]
];

const overviewRows = [
  ["Plan A", "Day 0/1", "7月11日", "乌鲁木齐落地休整、自治区博物馆、国际大巴扎", "如家NEO酒店（黄河路中医院和田二街店）", "已订"],
  ["Plan A", "Day 2", "7月12日", "乌鲁木齐 → S101百里丹霞 → 安集海大峡谷 → 奎屯；肯斯瓦特按时间选择", "奎屯市", "待订"],
  ["Plan A", "Day 3", "7月13日", "奎屯 → 独库北段 → 乔尔玛 → 唐布拉 → 孟克特 → 新源", "新源县城", "待订"],
  ["Plan A", "Day 4", "7月14日", "新源 → 库尔德宁，下午游雪岭云杉与山谷草甸", "库尔德宁镇/景区入口附近", "待订"],
  ["Plan A", "Day 5", "7月15日", "库尔德宁 → 喀拉峻 → 特克斯", "特克斯县城", "待订"],
  ["Plan A", "Day 6", "7月16日", "特克斯直接前往夏塔，游览后返回昭苏", "昭苏县城", "待订"],
  ["Plan A", "Day 7", "7月17日", "昭苏 → 伊昭公路 → 伊宁 → 喀赞其 → 六星街", "伊宁市", "待订"],
  ["Plan A", "Day 8", "7月18日", "伊宁 → 果子沟 → 赛里木湖环湖 → 精河", "精河县城", "待订"],
  ["Plan A", "Day 9", "7月19日", "精河 → 乌鲁木齐还车 → 17:00航班", "当日返程", "无需住宿"],
  ["Plan B", "Day 2-9", "7月12日-19日", "独库封路备用路线，待确认绕行方向后填写", "按绕行节点确定", "待规划"],
  ["Plan C", "Day 2-9", "7月12日-19日", "极端天气保守路线，待天气窗口确定后填写", "优先城市及低海拔住宿", "待规划"]
];

const timelineRows = [
  ["Plan A", "Day 0", "7月11日", "01:00", "抵达乌鲁木齐天山国际机场", "机场 → 如家NEO酒店", "25-30", "35-50分钟", "取行李、网约车前往酒店", "如家NEO酒店", "酒店订单从7月10日晚开始"],
  ["Plan A", "Day 0", "7月11日", "02:00-03:30", "入住、附近夜宵、休息", "酒店周边", "", "", "简单夜宵，不跨区折返", "如家NEO酒店", "提前确认24小时前台保留房间"],
  ["Plan A", "Day 1", "7月11日", "10:00-10:45", "起床、早餐、出发", "酒店 → 自治区博物馆", "6-8", "20-30分钟", "打车", "如家NEO酒店", "凌晨入睡，上午不要排太早"],
  ["Plan A", "Day 1", "7月11日", "11:30-14:30", "新疆维吾尔自治区博物馆", "博物馆", "", "", "五星出东方、楼兰文物等", "如家NEO酒店", "提前预约"],
  ["Plan A", "Day 1", "7月11日", "14:30-16:30", "友好商圈午餐、回酒店休息", "博物馆 → 酒店", "6-8", "20-30分钟", "午餐、补觉", "如家NEO酒店", ""],
  ["Plan A", "Day 1", "7月11日", "18:00-21:30", "国际大巴扎、和田二街晚餐", "酒店 → 大巴扎/和田二街", "3-5", "15-25分钟", "城市夜景、美食、采购路餐", "如家NEO酒店", "睡前确认租车订单"],
  ["Plan A", "Day 2", "7月12日", "07:00-08:30", "取车、验车、加油", "酒店 → 神州租车国际大巴扎门店", "3-6", "15-25分钟", "拍车况视频，检查轮胎和保险", "奎屯市", "以门店实际营业时间为准"],
  ["Plan A", "Day 2", "7月12日", "08:00-10:30", "前往百里丹霞", "租车门店 → S101百里丹霞东段", "100-120", "2-2.5小时", "连霍高速转X146/S101", "奎屯市", ""],
  ["Plan A", "Day 2", "7月12日", "10:30-13:30", "S101百里丹霞风景道", "东段 → 西段/肯斯瓦特分岔", "80-100", "边走边玩2.5-3.5小时", "丹霞、峡谷、草甸；自带路餐", "奎屯市", "安全停车，不必每点都停"],
  ["Plan A", "Day 2", "7月12日", "13:00-14:30", "肯斯瓦特水库（可选）", "西段 → 肯斯瓦特", "20-35", "40-60分钟", "13:30后原则上放弃", "奎屯市", "最晚14:30离开"],
  ["Plan A", "Day 2", "7月12日", "14:30-18:30", "前往安集海大峡谷", "肯斯瓦特/西段 → 安集海", "190-230", "3-4小时", "经S223/G30等，以导航为准", "奎屯市", "仅官方开放时进入"],
  ["Plan A", "Day 2", "7月12日", "18:30-21:00", "安集海游览、前往奎屯", "安集海 → 奎屯", "65-85", "1-1.5小时", "峡谷停留45-60分钟", "奎屯市", "17:30仍未到附近则直接去奎屯"],
  ["Plan A", "Day 3", "7月13日", "06:30-07:30", "奎屯出发进入独库", "奎屯 → 独库起点", "20-30", "30-40分钟", "按最早预约时段进入", "新源县城", "独库预约截图留存"],
  ["Plan A", "Day 3", "7月13日", "08:00-12:30", "独库公路北段", "独库起点 → 乔尔玛", "135-145", "3.5-4.5小时", "防雪长廊、达坂、老虎口等", "新源县城", "只在正规停车区停靠"],
  ["Plan A", "Day 3", "7月13日", "12:30-14:30", "乔尔玛、唐布拉百里画廊", "乔尔玛 → 唐布拉核心段", "40-60", "边走边停1.5-2小时", "烈士陵园、喀什河谷草原", "新源县城", "简餐，把主要时间留给孟克特"],
  ["Plan A", "Day 3", "7月13日", "14:30-17:00", "前往并游览孟克特", "唐布拉核心段 → 孟克特", "50-80", "1.5-2小时+游览", "景区建议3-4小时，按现场取舍", "新源县城", "17:00仍未离开应考虑就近住宿"],
  ["Plan A", "Day 3", "7月13日", "17:00-22:00+", "前往新源县", "孟克特 → 新源", "160-200", "3.5-4.5小时", "减少停车，安全优先", "新源县城", "当日强度最高，避免疲劳驾驶"],
  ["Plan A", "Day 4", "7月14日", "08:30-12:30", "新源前往库尔德宁", "新源 → 巩留 → 库尔德宁", "150-180", "3-4小时", "新源加油、采购路餐", "库尔德宁镇/景区入口", ""],
  ["Plan A", "Day 4", "7月14日", "13:00-18:00", "库尔德宁景区", "住宿地 → 景区入口", "5-20", "10-30分钟", "雪岭云杉、山谷草甸、河谷森林", "库尔德宁镇/景区入口", "确认车辆通行和最晚入园"],
  ["Plan A", "Day 5", "7月15日", "07:30-12:30", "库尔德宁前往喀拉峻", "库尔德宁 → 巩留 → 喀拉峻", "175-220", "3.5-4.5小时", "路餐或景区附近简餐", "特克斯县城", ""],
  ["Plan A", "Day 5", "7月15日", "12:30-18:00", "东西喀拉峻草原线", "喀拉峻景区", "", "", "鲜花台、猎鹰台等", "特克斯县城", "不同时安排阔克苏全线"],
  ["Plan A", "Day 5", "7月15日", "18:00-20:00", "前往特克斯、晚餐", "喀拉峻 → 特克斯", "30-40", "45-60分钟", "入住后轻松散步", "特克斯县城", ""],
  ["Plan A", "Day 6", "7月16日", "07:30-11:30", "特克斯直接前往夏塔", "特克斯 → 昭苏 → 夏塔", "185-205", "3-4小时", "使用自带路餐，午前入园", "昭苏县城", "提前购买夏塔门票"],
  ["Plan A", "Day 6", "7月16日", "11:30-18:00", "夏塔旅游景区", "景区内部", "", "", "区间车、将军桥、鲜花台、冰川观景方向", "昭苏县城", "按末班车时间折返"],
  ["Plan A", "Day 6", "7月16日", "18:00-21:00", "返回昭苏", "夏塔 → 昭苏", "70-80", "1-1.5小时", "入住、晚餐", "昭苏县城", "携带边防证或确认最新政策"],
  ["Plan A", "Day 7", "7月17日", "09:00-14:30", "伊昭公路", "昭苏 → 达坂 → 伊宁", "150-180", "3.5-4.5小时", "高山花海、悬崖公路、达坂", "伊宁市", "出发前昭苏加满油"],
  ["Plan A", "Day 7", "7月17日", "15:30-18:00", "喀赞其民俗村", "伊宁酒店 → 喀赞其", "3-8", "15-25分钟", "蓝色街巷、民俗体验", "伊宁市", ""],
  ["Plan A", "Day 7", "7月17日", "18:00-21:30", "六星街、晚餐", "喀赞其 → 六星街", "5-7", "15-25分钟", "冰淇淋、手抓饭、城市夜生活", "伊宁市", ""],
  ["Plan A", "Day 8", "7月18日", "07:30-10:30", "伊宁经果子沟前往赛里木湖", "伊宁 → 果子沟 → 赛湖入口", "135-160", "2-2.75小时", "离开伊宁前加满油", "精河县城", ""],
  ["Plan A", "Day 8", "7月18日", "10:30-17:30", "赛里木湖环湖", "赛里木湖环湖公路", "约90", "纯驾驶约2小时", "松树头、克勒涌珠、亲水滩、月亮湾", "精河县城", "含停留5-7小时，不等日落"],
  ["Plan A", "Day 8", "7月18日", "17:30-21:00", "前往精河", "赛湖东侧出口 → 精河", "140-160", "2-2.5小时", "高速行驶，抵达后晚餐", "精河县城", "最晚18:00离开景区"],
  ["Plan A", "Day 9", "7月19日", "06:30-12:30", "精河返回乌鲁木齐", "精河 → 乌鲁木齐", "410-440", "4.5-5.5小时", "连霍高速", "当日返程", "最晚07:00出发"],
  ["Plan A", "Day 9", "7月19日", "12:30-14:30", "加油、还车、前往机场", "市区 → 还车门店 → 机场", "25-45", "1-1.5小时", "13:30前完成还车", "当日返程", "不安排购物和景点"],
  ["Plan A", "Day 9", "7月19日", "17:00", "航班起飞", "乌鲁木齐天山国际机场", "", "", "返程", "当日返程", "14:30前到机场"]
];

const lodgingRows = [
  ["共用", "7月10日-11日", "乌鲁木齐", "如家NEO酒店（乌鲁木齐黄河路中医院和田二街店）", "已订", "7月10日入住、7月12日退房；确认凌晨入住和24小时前台"],
  ["Plan A", "7月12日", "奎屯", "奎屯市酒店", "待订", "停车方便，次日早出发前往独库"],
  ["Plan A", "7月13日", "新源", "新源县城酒店", "待订", "预计晚到，选择可晚入住并停车的酒店"],
  ["Plan A", "7月14日", "库尔德宁", "库尔德宁镇/景区入口民宿", "待订", "确认停车、热水、晚餐与取消政策"],
  ["Plan A", "7月15日", "特克斯", "特克斯县城酒店", "待订", "靠近餐饮，方便次日直接出发"],
  ["Plan A", "7月16日", "昭苏", "昭苏县城酒店", "待订", "可晚入住、有停车位"],
  ["Plan A", "7月17日", "伊宁", "伊宁市酒店", "待订", "方便前往喀赞其、六星街及次日出城"],
  ["Plan A", "7月18日", "精河", "精河县城酒店", "待订", "靠近G30入口，便于D9早出发"],
  ["Plan B", "待定", "绕行节点", "可取消酒店", "待规划", "优先收藏奎屯、伊宁、巩留等节点"],
  ["Plan C", "待定", "城市/低海拔节点", "可取消酒店", "待规划", "根据天气和道路动态决定"]
];

const bookingRows = [
  ["共用", "机票", "乌鲁木齐往返航班", "已完成", "出发前", "确认航站楼与行李额度"],
  ["共用", "酒店", "乌鲁木齐如家NEO", "已完成", "已预订", "确认7月11日凌晨保留房间"],
  ["共用", "租车", "神州租车国际大巴扎门店", "待确认", "7月11日晚", "门店营业时间、取还车材料、保险"],
  ["Plan A", "道路", "独库公路北段预约", "待办理", "提前1-7天", "游新疆一码游；选择7月13日乌苏驿入口"],
  ["Plan A", "道路", "伊昭公路开放状态", "待确认", "7月16日晚/17日早", "天气和交管决定是否切换方案"],
  ["Plan A", "景区", "孟克特开放与车辆要求", "待确认", "出发前1-3天", "轿车/SUV要求、最晚入园"],
  ["Plan A", "景区", "喀拉峻门票与线路", "待预约", "提前1-3天", "只选东西喀拉峻主线"],
  ["Plan A", "景区", "夏塔门票与区间车", "待预约", "提前购票", "确认末班车与边防政策"],
  ["Plan A", "景区", "赛里木湖自驾票", "待预约", "提前1-3天", "确认进出口和环湖方向"],
  ["Plan B", "路线", "独库封路绕行路线", "待规划", "D3前一晚", "触发后立即更新住宿和里程"],
  ["Plan C", "路线", "极端天气保守路线", "待规划", "出发前/行程中", "优先道路等级高、低海拔节点"]
];

const packingGroups = [
  ["共用", "证件与订单", "身份证原件", "未准备", "全程加油、住宿、景区可能使用"],
  ["共用", "证件与订单", "驾驶证、租车订单和保险凭证", "未准备", ""],
  ["共用", "证件与订单", "酒店订单与联系电话", "未准备", ""],
  ["共用", "证件与订单", "昭苏/夏塔边防证或最新政策确认", "未准备", ""],
  ["共用", "预约与路况", "独库预约截图", "未准备", "Plan A关键依赖"],
  ["共用", "预约与路况", "夏塔、喀拉峻、赛里木湖预约", "未准备", ""],
  ["共用", "预约与路况", "高德离线地图", "未准备", "山区信号不稳定"],
  ["共用", "衣物防护", "冲锋衣或薄羽绒服", "未准备", "独库、夏塔、赛里木湖"],
  ["共用", "衣物防护", "防滑徒步鞋与备用袜子", "未准备", ""],
  ["共用", "衣物防护", "SPF50+防晒、帽子、墨镜、冰袖", "未准备", ""],
  ["共用", "衣物防护", "雨衣、防蚊液", "未准备", ""],
  ["共用", "车辆电子", "轮胎、备胎、刹车、玻璃水检查", "未准备", "取车时拍摄视频"],
  ["共用", "车辆电子", "车载充电器、充电线、充电宝", "未准备", ""],
  ["共用", "车辆电子", "手机支架与离线导航", "未准备", ""],
  ["共用", "补给药品", "饮用水、保温杯、路餐", "未准备", ""],
  ["共用", "补给药品", "感冒、肠胃、晕车、止痛药", "未准备", ""],
  ["共用", "补给药品", "创可贴、消毒湿巾、小急救包", "未准备", ""],
  ["共用", "补给药品", "垃圾袋、纸巾和湿巾", "未准备", ""],
  ["共用", "最终确认", "天气、路况和景区开放状态", "未准备", "出发前7天、3天、前一晚"],
  ["共用", "最终确认", "Plan B/C关键住宿收藏", "未准备", "选择可取消酒店"]
];

// 方案中心
const planSheet = wb.worksheets.add("方案中心");
styleTitle(planSheet, "新疆伊犁环线自驾｜多方案中心", "在这里查看 Plan A / B / C 的适用条件与路线差异；状态列可直接更新。", "G");
planSheet.getRange("A4:G4").values = [["方案", "定位", "触发/适用条件", "路线概要", "预计里程", "天数", "状态"]];
planSheet.getRange(`A5:G${4 + planRows.length}`).values = planRows;
styleTable(planSheet, "A4:G4", `A5:G${4 + planRows.length}`);
planSheet.getRange(`G5:G${4 + planRows.length}`).dataValidation = { rule: { type: "list", values: ["已规划", "待完善", "启用", "停用"] } };
planSheet.getRange("G5:G7").conditionalFormats.add("containsText", { text: "已规划", format: { fill: colors.greenSoft, font: { color: colors.green, bold: true } } });
planSheet.getRange("G5:G7").conditionalFormats.add("containsText", { text: "待完善", format: { fill: colors.amberSoft, font: { color: colors.amber, bold: true } } });
planSheet.getRange("A10:F10").values = [["方案", "天数", "日期", "一句话行程", "住宿位置", "住宿状态"]];
planSheet.getRange(`A11:F${10 + overviewRows.length}`).values = overviewRows;
styleTable(planSheet, "A10:F10", `A11:F${10 + overviewRows.length}`);
planSheet.getRange(`F11:F${10 + overviewRows.length}`).dataValidation = { rule: { type: "list", values: ["已订", "待订", "无需住宿", "待规划"] } };
planSheet.getRange(`F11:F${10 + overviewRows.length}`).conditionalFormats.add("containsText", { text: "已订", format: { fill: colors.greenSoft, font: { color: colors.green, bold: true } } });
planSheet.getRange(`F11:F${10 + overviewRows.length}`).conditionalFormats.add("containsText", { text: "待订", format: { fill: colors.amberSoft, font: { color: colors.amber } } });
planSheet.freezePanes.freezeRows(4);
planSheet.getRange("A:G").format.columnWidth = 15;
planSheet.getRange("A:A").format.columnWidth = 11;
planSheet.getRange("B:B").format.columnWidth = 16;
planSheet.getRange("C:C").format.columnWidth = 28;
planSheet.getRange("D:D").format.columnWidth = 58;
planSheet.getRange("E:E").format.columnWidth = 27;
planSheet.getRange("F:G").format.columnWidth = 13;
planSheet.getRange(`A4:G${10 + overviewRows.length}`).format.autofitRows();

// 每日时间表
const timelineSheet = wb.worksheets.add("每日时间表");
styleTitle(timelineSheet, "每日时间安排与分段路线", "按“方案”筛选 Plan A / B / C；公里数和驾驶时间为规划估算，山区建议额外预留20%。", "K");
timelineSheet.getRange("A4:K4").values = [["方案", "天数", "日期", "时间", "行程/景点", "路线分段", "里程(km)", "预计时间", "游玩与执行内容", "住宿", "注意事项"]];
timelineSheet.getRange(`A5:K${4 + timelineRows.length}`).values = timelineRows;
styleTable(timelineSheet, "A4:K4", `A5:K${4 + timelineRows.length}`);
timelineSheet.tables.add(`A4:K${4 + timelineRows.length}`, true, "PlanTimeline");
timelineSheet.freezePanes.freezeRows(4);
timelineSheet.freezePanes.freezeColumns(4);
const widths = [10, 10, 12, 15, 27, 34, 12, 20, 36, 22, 38];
widths.forEach((width, index) => timelineSheet.getRangeByIndexes(0, index, 4 + timelineRows.length, 1).format.columnWidth = width);
timelineSheet.getRange(`A5:A${4 + timelineRows.length}`).format = { fill: colors.tealSoft, font: { bold: true, color: colors.teal }, horizontalAlignment: "center" };
timelineSheet.getRange(`D5:D${4 + timelineRows.length}`).format = { font: { bold: true, color: colors.blue }, horizontalAlignment: "center", wrapText: true };
timelineSheet.getRange(`G5:H${4 + timelineRows.length}`).format = { fill: "#F5F3ED", horizontalAlignment: "center", verticalAlignment: "center", wrapText: true };
timelineSheet.getRange(`A4:K${4 + timelineRows.length}`).format.autofitRows();

// Plan B/C 模板
const branchSheet = wb.worksheets.add("Plan B-C模板");
styleTitle(branchSheet, "Plan B / Plan C 分支模板", "复制或填写对应行即可形成备用路线；字段与主时间表一致，便于后续合并比较。", "K");
branchSheet.getRange("A4:K4").values = [["方案", "天数", "日期", "时间", "行程/景点", "路线分段", "里程(km)", "预计时间", "游玩与执行内容", "住宿", "注意事项"]];
const branchRows = [];
for (const plan of ["Plan B", "Plan C"]) {
  for (let day = 2; day <= 9; day++) {
    branchRows.push([plan, `Day ${day}`, `7月${10 + day}日`, "", "", "", "", "", "", "", ""]);
  }
}
branchSheet.getRange(`A5:K${4 + branchRows.length}`).values = branchRows;
styleTable(branchSheet, "A4:K4", `A5:K${4 + branchRows.length}`);
branchSheet.tables.add(`A4:K${4 + branchRows.length}`, true, "BranchPlanTemplate");
branchSheet.getRange(`A5:A${4 + branchRows.length}`).dataValidation = { rule: { type: "list", values: ["Plan B", "Plan C"] } };
branchSheet.freezePanes.freezeRows(4);
branchSheet.freezePanes.freezeColumns(4);
widths.forEach((width, index) => branchSheet.getRangeByIndexes(0, index, 4 + branchRows.length, 1).format.columnWidth = width);
branchSheet.getRange(`A5:A${4 + branchRows.length}`).format = { fill: colors.amberSoft, font: { bold: true, color: colors.amber }, horizontalAlignment: "center" };
branchSheet.getRange(`A4:K${4 + branchRows.length}`).format.rowHeight = 28;

// 住宿与预约
const bookingSheet = wb.worksheets.add("住宿与预约");
styleTitle(bookingSheet, "住宿与预约追踪", "“适用方案”为共用时代表 Plan A/B/C 均需；状态列带下拉选项。", "F");
bookingSheet.getRange("A4:F4").values = [["适用方案", "日期", "城市/节点", "住宿", "状态", "备注"]];
bookingSheet.getRange(`A5:F${4 + lodgingRows.length}`).values = lodgingRows;
styleTable(bookingSheet, "A4:F4", `A5:F${4 + lodgingRows.length}`);
bookingSheet.getRange(`E5:E${4 + lodgingRows.length}`).dataValidation = { rule: { type: "list", values: ["已订", "待订", "待规划", "无需住宿"] } };
const bookingStart = 7 + lodgingRows.length;
bookingSheet.getRange(`A${bookingStart}:F${bookingStart}`).values = [["适用方案", "类别", "事项", "状态", "完成时点", "说明"]];
bookingSheet.getRange(`A${bookingStart + 1}:F${bookingStart + bookingRows.length}`).values = bookingRows;
styleTable(bookingSheet, `A${bookingStart}:F${bookingStart}`, `A${bookingStart + 1}:F${bookingStart + bookingRows.length}`);
bookingSheet.getRange(`D${bookingStart + 1}:D${bookingStart + bookingRows.length}`).dataValidation = { rule: { type: "list", values: ["已完成", "待确认", "待办理", "待预约", "待规划", "不适用"] } };
bookingSheet.getRange(`E5:E${4 + lodgingRows.length}`).conditionalFormats.add("containsText", { text: "已订", format: { fill: colors.greenSoft, font: { color: colors.green, bold: true } } });
bookingSheet.getRange(`D${bookingStart + 1}:D${bookingStart + bookingRows.length}`).conditionalFormats.add("containsText", { text: "已完成", format: { fill: colors.greenSoft, font: { color: colors.green, bold: true } } });
bookingSheet.freezePanes.freezeRows(4);
bookingSheet.getRange("A:A").format.columnWidth = 14;
bookingSheet.getRange("B:B").format.columnWidth = 16;
bookingSheet.getRange("C:C").format.columnWidth = 24;
bookingSheet.getRange("D:D").format.columnWidth = 28;
bookingSheet.getRange("E:E").format.columnWidth = 14;
bookingSheet.getRange("F:F").format.columnWidth = 55;
bookingSheet.getUsedRange().format.autofitRows();

// 必带物品
const packingSheet = wb.worksheets.add("必带物品");
styleTitle(packingSheet, "必带物品与准备进度", "状态列可选择“未准备 / 已准备 / 不适用”，顶部进度由公式自动计算。", "E");
packingSheet.getRange("A4:B6").values = [
  ["总项目", packingGroups.length],
  ["已准备", null],
  ["准备进度", null]
];
packingSheet.getRange("B5").formulas = [[`=COUNTIF(D10:D${9 + packingGroups.length},"已准备")`]];
packingSheet.getRange("B6").formulas = [["=IF(B4=0,0,B5/B4)"]];
packingSheet.getRange("B6").format.numberFormat = "0%";
packingSheet.getRange("A4:B6").format = {
  fill: colors.tealSoft,
  font: { bold: true, color: colors.ink },
  borders: { preset: "outside", style: "thin", color: colors.teal }
};
packingSheet.getRange("A9:E9").values = [["适用方案", "类别", "物品/事项", "状态", "说明"]];
packingSheet.getRange(`A10:E${9 + packingGroups.length}`).values = packingGroups;
styleTable(packingSheet, "A9:E9", `A10:E${9 + packingGroups.length}`);
packingSheet.tables.add(`A9:E${9 + packingGroups.length}`, true, "PackingChecklist");
packingSheet.getRange(`D10:D${9 + packingGroups.length}`).dataValidation = { rule: { type: "list", values: ["未准备", "已准备", "不适用"] } };
packingSheet.getRange(`D10:D${9 + packingGroups.length}`).conditionalFormats.add("containsText", { text: "已准备", format: { fill: colors.greenSoft, font: { color: colors.green, bold: true } } });
packingSheet.getRange(`D10:D${9 + packingGroups.length}`).conditionalFormats.add("containsText", { text: "未准备", format: { fill: colors.coralSoft, font: { color: colors.coral } } });
packingSheet.getRange(`D10:D${9 + packingGroups.length}`).conditionalFormats.add("containsText", { text: "不适用", format: { fill: "#ECECEC", font: { color: colors.muted } } });
packingSheet.freezePanes.freezeRows(9);
packingSheet.getRange("A:A").format.columnWidth = 14;
packingSheet.getRange("B:B").format.columnWidth = 18;
packingSheet.getRange("C:C").format.columnWidth = 38;
packingSheet.getRange("D:D").format.columnWidth = 14;
packingSheet.getRange("E:E").format.columnWidth = 45;
packingSheet.getUsedRange().format.autofitRows();

// Source comments
wb.comments.addThread({ cell: planSheet.getRange("D5") }, "来源：当前项目中的《新疆9天8晚伊犁环线自驾行程规划.md》与高德路线缓存数据。");
wb.comments.addThread({ cell: timelineSheet.getRange("G5") }, "里程为行程规划估算。出发前一晚请使用实际住宿和景区入口重新导航。");

const outPath = `${outputDir}/新疆伊犁环线多方案行程表.xlsx`;
const xlsx = await SpreadsheetFile.exportXlsx(wb);
await xlsx.save(outPath);

for (const [sheetName, range, fileName] of [
  ["方案中心", "A1:G21", "preview-plan.png"],
  ["每日时间表", "A1:K18", "preview-timeline.png"],
  ["Plan B-C模板", "A1:K20", "preview-branches.png"],
  ["住宿与预约", "A1:F34", "preview-booking.png"],
  ["必带物品", "A1:E29", "preview-packing.png"]
]) {
  const preview = await wb.render({ sheetName, range, scale: 1, format: "png" });
  await fs.writeFile(`${outputDir}/${fileName}`, new Uint8Array(await preview.arrayBuffer()));
}

const check = await wb.inspect({
  kind: "table",
  range: "方案中心!A1:G21",
  include: "values,formulas",
  tableMaxRows: 21,
  tableMaxCols: 7
});
console.log(check.ndjson);

const errors = await wb.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 100 },
  summary: "final formula error scan"
});
console.log(errors.ndjson);
console.log(outPath);
