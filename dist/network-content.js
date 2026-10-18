export const RELAY_BV='BV1Qh4y1q7Hs';
export const CANTEEN_BV='BV1Qh4y1c3Dn';
export const SITES={
 forum:{name:'青禾论坛',home:'#forum',icon:'assets/favicon.svg',host:'qinghe.local'},
 portal:{name:'智慧后勤 · 一卡通',home:'#portal/home',icon:'assets/portal.svg',host:'canteen.qinghe.edu.cn'},
 video:{name:'哔哩哔哩 · 校园镜像',home:'#video',icon:'assets/video.svg',host:'bilibili.com'},
 pan:{name:'青禾网盘',home:'#pan',icon:'assets/pan.svg',host:'pan.qinghe.local'}
};
export const CARD_STUDENT='20220327';
export const CARD_ROWS=[
 ['C0312-1842','2025-03-12 18:42:09','夜宵窗口02 / QH-C02','晚餐加购','6.00','0312-0182'],
 ['C0313-2147','2025-03-13 21:47:12','夜宵窗口02 / QH-C02','火鸡面 / 饭团 / 紫菜汤','18.00','0313-0367'],
 ['C0314-2132','2025-03-14 21:32:48','夜宵窗口03 / QH-C03','车仔面','10.00','0314-0402']
];
export const VIDEOS={
 [RELAY_BV]:{id:RELAY_BV,title:'接力花絮｜跑完最后一棒，先把相机还我',up:'青禾摄影社',date:'2024-10-20',duration:132,views:'1.2万',kind:'relay',description:'校运会随手剪的，正式比赛和补拍不是一天。别拿封面认机位。源素材在置顶楼，提取规则：片头拍摄月日四位，后接场记牌上的机位字母。',danmaku:[{at:7,text:'前面那位把镜头挡严实了哈哈哈'},{at:28,text:'最后一棒真的追上了'},{at:55,text:'这谁拍的，跑得比运动员还急'},{at:84,text:'后排像小丑？他不是说去器材室了吗，怎么又在看台'},{at:106,text:'别在远景里认人了，这画质连我自己都认不出'}]},
 [CANTEEN_BV]:{id:CANTEEN_BV,title:'夜宵窗口收摊前二十分钟｜校刊素材备份',up:'青禾广播站',date:'2025-03-16',duration:110,views:'2368',kind:'canteen',description:'3月13日晚，食堂外走廊。拍摄范围不包含后厨，画面里的灯不能代替设备运行记录。',danmaku:[{at:12,text:'又是下课就没面的一天'},{at:47,text:'走廊有灯不等于消毒间那路有电吧'},{at:84,text:'后门那块维修牌挂到什么时候啊'}]},
 BV1Qh4y1d1Ly:{id:'BV1Qh4y1d1Ly',title:'广播站的一天：晚自习前五分钟',up:'青禾广播站',date:'2025-03-09',duration:96,views:'893',kind:'daily',description:'麦克风没开，最后还是喊的。',danmaku:[{at:12,text:'周五那首歌我点的'},{at:48,text:'这个广播台真的该修了'}]}
};
export const NETWORK_CLUES={
 videoFrame:{id:'videoFrame',code:'V01',title:'花絮01:24的场记牌',text:'画面里能看清B机标记，远景人影不能凭弹幕认定身份。原素材还需核对拍摄日。',route:'#video/'+RELAY_BV},
 relayRegister:{id:'relayRegister',code:'V02',title:'摄影社源素材登记',text:'10月17日A机试拍、18日B机比赛、19日C机补拍。剪辑片段与原始拍摄日分开登记。',route:'#pan/relay'}
};
export const RELAY_REGISTER={title:'摄影社源素材交接登记',columns:['素材号','拍摄日期','用途','机位','说明'],rows:[['T1017-A','2024-10-17','试拍','A','测试曝光'],['R1018-B','2024-10-18','正式比赛','B','花絮01:24取自本卷'],['P1019-C','2024-10-19','补拍','C','补跑道空镜；不是正式比赛日']]};
export const MAINTENANCE={title:'WX0313-18 维修报备归档',columns:['工单','日期时间','设备/回路','处置记录'],rows:[['WX0313-18','2025-03-13 20:18','XD-02 消毒间专用回路','停用并断电'],['WX0313-18','2025-03-13 20:26','同一回路','电工到场；无备用电源'],['WX0313-18','2025-03-13 21:06','同一回路','恢复供电，值班人员签认']]};
