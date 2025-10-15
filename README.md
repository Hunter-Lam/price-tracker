# Tauri + React + Typescript

This template should help get you started developing with Tauri, React and Typescript in Vite.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## Prerequisites

```shell
curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh
1) Proceed with standard installation (default - just press enter)
2) Customize installation
3) Cancel installation

# select 1)
```

```shell
error: could not amend shell profile: '~/.profile': could not write rcfile file: '~/.profile': Permission denied (os error 13)
```

```shell
To get started you need Cargo's bin directory ($HOME/.cargo/bin) in your PATH
environment variable. This has not been done automatically.

To configure your current shell, you need to source
the corresponding env file under $HOME/.cargo.

This is usually done by running one of the following (note the leading DOT):
. "$HOME/.cargo/env"            # For sh/bash/zsh/ash/dash/pdksh
source "$HOME/.cargo/env.fish"  # For fish
source $"($nu.home-path)/.cargo/env.nu"  # For nushell
```


## TODO 
remove page width limit
use antd build-in style as much as possible
use antd layout rather than custom-style <div>
$1.7 ---
support dark mode
remark form item should occupy a whole row
$4.4 ---
https://item.jd.com/100226972106.html#switch-sku
https://item.jd.com/100226972106.html#none
https://item.m.jd.com/product/100226972106.html?utm_term=CopyURL_shareid7c06ddc1680e7a8cf3e5adc289703cf1a014cca817550055567937_shangxiang_none&gx=RnAomzgFNWGaypkWq4x3WgwnjrEpqpM&utm_source=iosapp&utm_campaign=t_335139774&utm_medium=appshare&ad_od=share&gxd=RnAoxDRZbmCNmJkTp4QiWs2Z8UcV2CDqPCIvp4XMyzrn2tMUZeGv9ZVQhRayQlU&jkl=@D5nFc8riJPSY@
https://item.jd.com/100226972106.html
$0.25 ---
discountinput use addonAfter or addonBefore rather than text, like 折扣 case
$0.25 ---
wrap discount input
$0.42 ---
parse get product information of the URL
$0.85 --- but do nothing
extract formatter
$0.6 ---
space.compact size
$0.1 --- can't do
remove button style
$0.2 ---
save data
$5.6 ---
draw a line chart
$0.6 ---
mock data
$1.4 ---
line chart search
table column
mock data
$7.4 ---
column controller
$0.9 ---
format and copy
$2.1 ---
clean code
$0.9 ---
discount parser
$45.32 ---
date position
$0.6 ---
csv export
$0.5 ---
garbled
1.4 ---
excel import


https://detail.tmall.com/item.htm?id=838057640110&skuId=5596547280623
券后
¥
229
优惠前
¥
269
已售 700+

距结束
48:46:55
25号0点满700减70
3期免息
每满1件减40

https://detail.tmall.com/item.htm?id=807978649708&skuId=5660286183077
券后
¥
53.03
优惠前
¥
74.8
已售 3000+

¥3店铺新客礼金限享一次 即时可用
店铺新客立减3元
淘金币已抵3.74元
满1件7.99折

https://detail.tmall.com/item.htm?id=716995980346&skuId=5176703494380
秒杀价
¥
9.81
优惠前
¥
13.8
·
已售 5万+
直降3.99元

https://detail.tmall.com/item.htm?id=589970566955
券后
¥
16.8
起
超级立减活动价
¥
20.8
起
已售 40万+

全场立减
满800减65
超级立减4元
满3件9.5折

https://item.taobao.com/item.htm?id=673424401238&skuId=5018923614824
券后
¥
189.46
优惠前
¥
318
·
已售 8
官方立减12%省39元
淘金币已抵9.54元
同店每68减20


https://item.jd.com/13642583.html
¥1107.8
到手价
购买立减
¥20.00
=
¥1127.8
京东价
-
优惠券¥20

https://item.jd.com/100116554433.html
¥25.2
到手价
购买立减
¥2.80
=
¥28
京东价
-
优惠券¥2.8
满1享9折减2.8


¥
225
已售 1000+

https://item.jd.com/100067100922.html
¥144
到手价
购买立减
¥5.00
=
¥149
京东价
-
优惠券¥5
满10减5

¥189
到手价
购买立减
¥10.00
=
¥199
京东价
-
促销¥10
首购礼金 10元

¥125.1
政府补贴价
购买立减
¥13.90
=
¥139
京东价
-
补贴¥13.9
政府补贴京东支付减¥13.9

¥129
到手价
购买立减
¥20.00
=
¥149
京东价
-
促销¥20
每满149减20

¥10.9
到手价
购买立减
¥1.00
=
¥11.9
京东价
-
促销¥1
首购礼金 1元

¥9.8
到手价
购买立减
¥1.00
=
¥10.8
京东价
-
促销¥1
首购礼金 1元

¥27.9
到手价
购买立减
¥2.00
=
¥29.9
京东价
-
促销¥2
首购礼金 2元

¥189
到手价
购买立减
¥10.00
=
¥199
京东价
-
优惠券¥10
神券满70减10

¥42.8
到手价
购买立减
¥2.00
=
¥44.8
京东价
-
促销¥2
满40减2

https://item.jd.com/3478323.html
￥20.06
优惠券

立即使用
8.8折
满88享8.8折
2025.08.29 23:59前有效
促销
满额返券
实付满1元，收货后返满10-5元券，先到先得，点击跳转活动落地页（仅app可跳转）

限购
特价品，购买至少1件时可享受单件价￥20.06，超出数量或优惠库存以结算价为准
跨自营/店铺满折
满2件，总价打9折

优惠

促销
满额返券
实付满1元，收货后返满10-5元券，先到先得，点击跳转活动落地页（仅app可跳转）

跨自营/店铺满折
满2件，总价打9折

更多优惠
返京豆
京东购物返京豆，订单完成后最高可返5京豆。特殊渠道订单不参与购物返豆，以订单实际返豆为准

https://item.jd.com/10021934281578.html
¥449
到手价
购买立减
¥600.00
=
¥1049
京东价
-
促销¥550
满999减550
-
优惠券¥50
满900减50


更新價格和優惠
醫用 藥用 藥材
日用
edit
原價聯動終價
copy URL if failing to open
show download location
select downlaod location
[Error] Tauri saveProduct error: – "attempt to write a readonly database"
	(anonymous function) (storage.ts:89)
[Error] Storage saveProduct error: – Error: Failed to save product to database: Unknown error — storage.ts:113
Error: Failed to save product to database: Unknown error — storage.ts:113
	(anonymous function) (storage.ts:144)
[Error] Failed to save product: – Error: Failed to save product to database: Unknown error — storage.ts:113
Error: Failed to save product to database: Unknown error — storage.ts:113
	(anonymous function) (App.tsx:111)
數量 x mL,L,兩,斤,kg,g,piece
set a affordable guide lines


{
    "userInfo": {},
    "laXinInfo": [
        {
            "laXinIconUrl": "https://img10.360buyimg.com/imagetools/jfs/t1/261718/22/6550/560/67769350Fdeefaae3/4bdb3c60cbde63ae.png",
            "laXinJumpUrl": "https://pro.jd.com/mall/active/3EvXpPX2KhxvnY6NzFXwQHpkszab/index.html?babelChannel=ttt8",
            "laXinText": "企业首购 部分满8000减400",
            "laXinType": "4"
        }
    ],
    "promiseFxgInfo": {},
    "isFsAndCustom": false,
    "beltBanner": "//img30.360buyimg.com/jdg/jfs/t1/227337/19/23404/13151/66866ad1Fc54ecc63/1c639234e88ba342.png",
    "csfhText": "厂商发货",
    "isLogin": true,
    "commonLimitInfo": {
        "limitBuyInfo": {},
        "limitMinNum": "1",
        "limitText": "仅限购买1件",
        "mergeMaxBuyNum": "1",
        "resultExtMap": {
            "noSaleFlag": "0",
            "limitNum": "1",
            "limitOrderNum": "1",
            "strategyFlag": "1",
            "canBuyPlusSku": "1",
            "limitUserFlag": "1",
            "mergeMaxBuyNumInfo": "{\"mergeMaxBuyNum\":1,\"strategyId\":3552206661,\"type\":2}",
            "sourceChannel": "ERP",
            "ruleTypeDesc": "每人每天最多可以下1单，最多可以购买1件，每单最多可以购买1件",
            "limitTotal": "1",
            "limitDay": "1",
            "limitPreOrderNum": "1",
            "peopleLimitCanBuyMap": "{\"20005\":{\"isLimit\":\"0\",\"canBuy\":\"1\"},\"20004\":{\"isLimit\":\"0\",\"canBuy\":\"1\"},\"20003\":{\"isLimit\":\"0\",\"canBuy\":\"1\"},\"20022\":{\"isLimit\":\"0\",\"canBuy\":\"1\"},\"20021\":{\"isLimit\":\"0\",\"canBuy\":\"1\"}}",
            "limitPeopleFlag": "1",
            "limitBuyStrategyList": "[{\"limitValue\":\"3\",\"strategyName\":\"990pro9100pro限购-除8T\",\"limitOrderNum\":\"1\",\"limitTimeUnit\":\"1\",\"sourceChannel\":\"ERP\",\"gatherId\":\"100153900833\",\"gatherType\":\"sku\",\"limitTotal\":\"1\",\"limitDay\":\"1\",\"limitPreOrderNum\":\"1\",\"limitType\":\"0\",\"strategyId\":\"3552206661\",\"beginTime\":\"2025-10-11 17:22:41\",\"endTime\":\"2028-10-10 17:22:41\",\"everyoneSurplusNum\":\"1\"}]",
            "canBuy": "1",
            "limitText": "仅限购买1件",
            "isPlusLimit": "0",
            "mergeMaxBuyNum": "1",
            "beginTime": "2025-10-11 17:22:41",
            "endTime": "2028-10-10 17:22:41",
            "isPaidMemberSku": "0",
            "limitAreaFlag": "1",
            "everyoneSurplusNum": "1"
        }
    },
    "isInstallNow": false,
    "govSupportInfo": {
        "ab": true,
        "beltBanner": "//img30.360buyimg.com/jdg/jfs/t1/263547/24/18280/20997/67a96901F1bef1e77/fcce6b07199642ff.png",
        "cloudPay": false,
        "govSubsidy": false,
        "govSupport": false,
        "rightText": "",
        "subsidyScene": "0",
        "subsidyType": "",
        "subsidyUserStatus": "",
        "yellowBar": false
    },
    "price": {
        "ab": true,
        "hagglePromotion": false,
        "id": "100153900833",
        "m": "2999.00",
        "op": "2499.00",
        "p": "1599.00",
        "regularPrice": "1784.18"
    },
    "ipCityCode": "2837",
    "wareInfoReadMap": {
        "thwa": "1",
        "cn_brand": "三星",
        "is7ToReturn": "1",
        "isHyj": "3",
        "SendService": "0",
        "vender_name": "北京京东世纪信息技术有限公司",
        "product_id": "100153900833",
        "timeliness_id": "",
        "height": "21",
        "unLimit_cid": "11303",
        "mspd": "1",
        "shop_id": "1000075981",
        "buyer_post": "11093",
        "size": "【2TB】",
        "sale_attributes": "[{\"dim\":1,\"saleName\":\"颜色\",\"saleValue\":\"旗舰9100 PRO|NVMe PCIe 5.0*4\",\"sequenceNo\":1},{\"dim\":2,\"saleName\":\"版本\",\"saleValue\":\"【2TB】\",\"sequenceNo\":4}]",
        "img_dfs_url": "jfs/t1/342518/10/12374/109106/68ee2ad7F05f10227/f1345e0a94264748.jpg",
        "category_id": "11303",
        "product_features": "",
        "isdangergoods": "0",
        "jc_saler": "cuibingrong",
        "day_limited_sales": "0",
        "wjtyd": "1",
        "isJIT": "0",
        "cxkfl": "1",
        "seriesId": "68648",
        "vender_attribute": "",
        "features": "inputVAT:13,outputVAT:13,consumptionVAT:0",
        "pay_first": "0",
        "weight": "0.060",
        "template_ids": "[601607182]",
        "shop_name": "三星存储京东自营旗舰店",
        "brand_id": "15127",
        "size_sequence": "4",
        "color": "旗舰9100 PRO|NVMe PCIe 5.0*4",
        "spec_sequence": "0",
        "shelf_life": "0",
        "vender_id": "1000075981",
        "isQdh": "0",
        "xscjh": "377,337,321,338,301,361,363,360,378",
        "category_id1": "670",
        "category_id2": "677",
        "sfkc": "9AA09BE03F13",
        "delivery": "",
        "companyType": "0",
        "length": "144",
        "sku_status": "1",
        "spec_name": "",
        "msbybt": "2",
        "main_sku_id": "100003181110",
        "yn": "1",
        "warranty": "5年质保",
        "sku_name": "三星（SAMSUNG）2TB SSD固态硬盘 M.2接口(NVMe协议PCIe5.0*4)AI电脑配件 读速14700MB/S 9100 PRO",
        "supply_unit": "jytzjwlkjy",
        "subZtType": "SPGX-XXNZT",
        "color_sequence": "1",
        "storeProperty": "0",
        "vender_col_type": "0",
        "bjxp": "0",
        "vender_bizid": "",
        "width": "98",
        "features2": "bbxzxg:1;bjxp:0;cxkfl:1;dszt:1;gypsshyzt:102_1,103_2,104_2,105_2,106_1,109_2,110_2,111_2,112_2;isrc:1;shortTitle:三星 9100 SSD固态硬盘;skuNameWithoutBrand:2TB SSD固态硬盘 M.2接口(NVMe协议PCIe5.0*4)AI电脑配件 读速14700MB/S 9100 PRO;subZtType:SPGX-XXNZT;zzstsba:1",
        "spec": "",
        "maxCartCat": "999",
        "SoldOversea": "7",
        "product_name": "三星（SAMSUNG）2TB SSD固态硬盘 M.2接口(NVMe协议PCIe5.0*4)AI电脑配件 读速14700MB/S 9100 PRO",
        "isOverseaPurchase": "0",
        "platform": "2049",
        "sku_mark": "0",
        "item_id": "-1",
        "isDnsmDept": "1"
    },
    "isCsfh": false,
    "isSfkd": false,
    "beltBannerInfo": {
        "bannerLeftIcon": "http://img30.360buyimg.com/jdg/jfs/t1/264240/18/14688/4808/679114edFb6c7bc08/3c65e8437d45ec8d.png",
        "bannerRightText": "买贵双倍赔",
        "bannerRightTextColor": "",
        "beltBannerUrl": "//img30.360buyimg.com/jdg/jfs/t1/265880/12/14668/58449/679114f3F87e46103/5d4b4abb54cf5d8e.png",
        "countDown": 0,
        "labels": "",
        "leftArrowIcon": "http://img30.360buyimg.com/jdg/jfs/t1/267812/39/14685/785/679114e2F3a5054ce/8657b41128a3ee8f.png",
        "leftIconLink": "https://pro.jd.com/mall/active/2evvPWwD9tbuxiDdBEqF8i4DxWjS/index.html",
        "middleIcon": "http://img30.360buyimg.com/jdg/jfs/t1/255477/28/24821/10835/67bc7c41F5ca05766/cf0ff48bf16bfde5.png",
        "subsidyType": "",
        "subsidyUserStatus": "",
        "type": "9",
        "yuYueNum": 0
    },
    "abData": {
        "indicator": {
            "abBuriedTag": "tsabtest|base64|UENUZXN0Xzc0MzYzfHByZQ|tsabtest",
            "business": "indicator",
            "keyParamMap": {},
            "label": "pre",
            "success": true
        },
        "preference_rebuild": {
            "abBuriedTag": "tsabtest|base64|UENUZXN0Xzg4MjA2fHByZQ|tsabtest",
            "keyParamMap": {},
            "label": "pre",
            "success": true,
            "type": "12"
        },
        "pc_rank": {
            "abBuriedTag": "tsabtest|base64|UENUZXN0Xzk4Mzg3fHNoaXlhbnp1X2JhbmdkYW4|tsabtest",
            "keyParamMap": {
                "duizhaozu": 1
            },
            "label": "shiyanzu_bangdan",
            "success": true,
            "type": "13"
        },
        "multi_price": {
            "abBuriedTag": "tsabtest|base64|UENUZXN0XzgxNjQ4fGJlc3Q|tsabtest",
            "business": "multi_price",
            "keyParamMap": {
                "hit": 1
            },
            "label": "best",
            "success": true
        },
        "new_people": {
            "abBuriedTag": "tsabtest|base64|UENUZXN0Xzk5ODE2fHhpbnJlbg|tsabtest",
            "keyParamMap": {
                "new_user": 1
            },
            "label": "xinren",
            "success": true,
            "type": "16"
        },
        "item_pk": {
            "abBuriedTag": "tsabtest|base64|UENUZXN0XzcyNjUyfGJhc2U|tsabtest",
            "business": "item_pk",
            "keyParamMap": {},
            "label": "base",
            "success": true
        },
        "main_image": {
            "abBuriedTag": "tsabtest|base64|UENUZXN0XzgzNTg3fHByZTI|tsabtest",
            "business": "main_image",
            "keyParamMap": {
                "first_show": 2
            },
            "label": "pre2",
            "success": true
        },
        "abTags": [
            "tsabtest|base64|UENUZXN0Xzk4Mzg3fHNoaXlhbnp1X2JhbmdkYW4|tsabtest",
            "tsabtest|base64|UGNBQlRlc3RfNzg3NTh8cHJl|tsabtest",
            "tsabtest|base64|UENUZXN0XzcxMzY2fGJhc2U|tsabtest",
            "tsabtest|base64|UENUZXN0XzkzMzcwfHRlc3Rfc2hpeWFuenU|tsabtest",
            "tsabtest|base64|UENUZXN0Xzc0MzYzfHByZQ|tsabtest",
            "tsabtest|base64|UENUZXN0XzgxNzI1fGJhc2U|tsabtest",
            "tsabtest|base64|UENUZXN0XzgyOTkzfGJlc3Q|tsabtest",
            "tsabtest|base64|UENUZXN0XzgzNTg3fHByZTI|tsabtest",
            "tsabtest|base64|UENUZXN0Xzk1ODAxfHNoaXlhbnp1X3Br|tsabtest",
            "tsabtest|base64|U01CQUJUZXN0Xzg0MTY1fHByZQ|tsabtest",
            "tsabtest|base64|UENUZXN0Xzk4OTk3fGJhc2U|tsabtest",
            "tsabtest|base64|UENUZXN0Xzc5MDE3fGJlc3Q|tsabtest",
            "tsabtest|base64|UENUZXN0XzcxNzM4fGJhc2U|tsabtest",
            "tsabtest|base64|UENUZXN0XzgzNDg2fEdhcF9ibGFuazpQQ1Rlc3RfODAyOTZ8R2Fw|tsabtest",
            "tsabtest|base64|UENUZXN0Xzg4MjA2fHByZQ|tsabtest",
            "tsabtest|base64|UENUZXN0XzgxNjQ4fGJlc3Q|tsabtest",
            "tsabtest|base64|UENUZXN0XzcyNjUyfGJhc2U|tsabtest",
            "tsabtest|base64|UENUZXN0Xzk5ODE2fHhpbnJlbg|tsabtest"
        ],
        "size_help": {
            "abBuriedTag": "tsabtest|base64|UENUZXN0XzkzMzcwfHRlc3Rfc2hpeWFuenU|tsabtest",
            "keyParamMap": {
                "size": 0
            },
            "label": "test_shiyanzu",
            "success": true,
            "type": "10"
        },
        "promotion_optimize": {
            "abBuriedTag": "tsabtest|base64|UENUZXN0Xzc5MDE3fGJlc3Q|tsabtest",
            "business": "promotion_optimize",
            "keyParamMap": {
                "hit": 1
            },
            "label": "best",
            "success": true
        },
        "xundan_guide": {
            "abBuriedTag": "tsabtest|base64|UENUZXN0Xzk4OTk3fGJhc2U|tsabtest",
            "keyParamMap": {
                "duizhaozu": 0
            },
            "label": "base",
            "success": true,
            "type": "15"
        },
        "enPlus_price": {
            "abBuriedTag": "tsabtest|base64|UGNBQlRlc3RfNzg3NTh8cHJl|tsabtest",
            "business": "enPlus_price",
            "keyParamMap": {},
            "label": "pre",
            "success": true
        },
        "sf_bg": {
            "abBuriedTag": "tsabtest|base64|UENUZXN0XzgzNDg2fEdhcF9ibGFuazpQQ1Rlc3RfODAyOTZ8R2Fw|tsabtest",
            "keyParamMap": {
                "SFtime": 0,
                "bg_jiange": 600,
                "test_shufang": 0,
                "bg_totaltime": 0,
                "bg_CDtotaltime": 0
            },
            "label": "Gap_blank",
            "success": true,
            "type": "9"
        },
        "enterprise_plus_guide": {
            "abBuriedTag": "tsabtest|base64|U01CQUJUZXN0Xzg0MTY1fHByZQ|tsabtest",
            "keyParamMap": {
                "duizhaozu": 1
            },
            "label": "pre",
            "success": true,
            "type": "14"
        },
        "item_gov_price": {
            "abBuriedTag": "tsabtest|base64|UENUZXN0XzcxMzY2fGJhc2U|tsabtest",
            "business": "item_gov_price",
            "keyParamMap": {},
            "label": "base",
            "success": true
        },
        "jing_dou": {
            "abBuriedTag": "tsabtest|base64|UENUZXN0XzgyOTkzfGJlc3Q|tsabtest",
            "keyParamMap": {},
            "label": "best",
            "success": true,
            "type": "8"
        },
        "shiyanzu_pk": {
            "abBuriedTag": "tsabtest|base64|UENUZXN0Xzk1ODAxfHNoaXlhbnp1X3Br|tsabtest",
            "business": "shiyanzu_pk",
            "keyParamMap": {
                "pklevelup_test": 1
            },
            "label": "shiyanzu_pk",
            "success": true
        },
        "item_gb2": {
            "abBuriedTag": "tsabtest|base64|UENUZXN0XzgxNzI1fGJhc2U|tsabtest",
            "business": "item_gb2",
            "keyParamMap": {},
            "label": "base",
            "success": true
        },
        "item_gb_fastTest": {
            "abBuriedTag": "tsabtest|base64|UENUZXN0XzcxNzM4fGJhc2U|tsabtest",
            "business": "item_gb_fastTest",
            "keyParamMap": {},
            "label": "base",
            "success": true
        }
    },
    "ext": {
        "govAb": true,
        "appleLimit": true,
        "multiAddCart": true,
        "entExc": true,
        "defaultUmc": true,
        "hxSubsidy": true,
        "bjkPrice": true,
        "xundanGuide": true
    },
    "isServiceJdkd": false,
    "rankInfoList": [
        {
            "rankName": "固态硬盘热卖榜·第2名",
            "rankTypeInt": 10,
            "rankUrl": "https://pro.jd.com/mall/active/4JRfHorUDXgL77E9YdNxSCNMKwkJ/index.html?pageNum=1&bbtf=1&queryType=1&rankId=3155510&rankType=10&fromName=ProductdetailPC&preSrc=null&currSku=100153900833&currSpu=100003181110"
        }
    ],
    "preference": {
        "preferenceLabel": [
            {
                "labelName": "限购",
                "type": "2"
            },
            {
                "labelName": "最高返79京豆",
                "type": "9"
            }
        ],
        "preferencePopUp": {
            "joinOrderPreference": [],
            "morePreference": [
                {
                    "bigPromotion": false,
                    "crossStoreFullCut": false,
                    "customTag": {
                        "p": "1599.00"
                    },
                    "formal": false,
                    "logPromoId": "325678466445",
                    "originType": "2",
                    "preferenceId": "325678466445",
                    "preferenceType": "2",
                    "proSortNum": 130,
                    "promoId": 325678466445,
                    "promoTags": [
                        38,
                        41,
                        42
                    ],
                    "tag": 3,
                    "text": "限购",
                    "typeNumber": "3",
                    "value": "购买至少1件时可享受单件价￥1599，超出数量以结算价为准"
                },
                {
                    "bigPromotion": false,
                    "buriedPoint": {
                        "beanNum": 79,
                        "sceneType": "1"
                    },
                    "crossStoreFullCut": false,
                    "formal": false,
                    "originType": "9",
                    "preferenceType": "9",
                    "shortText": "最高返79京豆",
                    "text": "返京豆",
                    "value": "京东购物返京豆，订单完成后最高可返79京豆。特殊渠道订单不参与购物返豆，以订单实际返豆为准"
                }
            ],
            "sharedPreference": []
        }
    },
    "wareInfo": {
        "extend": {},
        "wareInfoMap": {
            "sku_status": "1"
        }
    },
    "warrantyInfo": {
        "originalFactoryServiceVo": {
            "serviceItems": [
                {
                    "products": [
                        {
                            "discount": "⚠️坏了免费换新",
                            "grey": false,
                            "itemIndex": 150,
                            "limitBuyNumber": "",
                            "limitBuyText": "",
                            "serviceSku": "100021961515",
                            "serviceSkuName": "4年全保换新",
                            "serviceSkuPrice": "159.00",
                            "tip": "质量、性能故障，只换不修",
                            "toastText": ""
                        },
                        {
                            "discount": "",
                            "grey": false,
                            "itemIndex": 233,
                            "limitBuyNumber": "",
                            "limitBuyText": "",
                            "serviceSku": "100038073190",
                            "serviceSkuName": "3年全保换新",
                            "serviceSkuPrice": "156.00",
                            "tip": "性能、意外故障只换不修",
                            "toastText": ""
                        }
                    ],
                    "scIconUrl": "https://img30.360buyimg.com/ling/jfs/t1/145812/4/22064/8442/626a4a2cE025e15a8/cd0a192287077a58.png",
                    "scId": 298,
                    "scName": "京东自营严选",
                    "scOrder": 19750
                },
                {
                    "products": [
                        {
                            "discount": "赠数据恢复服务",
                            "grey": false,
                            "itemIndex": 133,
                            "limitBuyNumber": "",
                            "limitBuyText": "",
                            "serviceSku": "100035012789",
                            "serviceSkuName": "7年性能保修",
                            "serviceSkuPrice": "92.00",
                            "tip": "延长保修时间，性能故障免费维修",
                            "toastText": ""
                        }
                    ],
                    "scIconUrl": "https://img14.360buyimg.com/ling/jfs/t1/130738/14/28752/4502/626a48dbE323fe6c5/21fc3d23a9a5e4c5.png",
                    "scId": 297,
                    "scName": "限时特惠",
                    "scOrder": 19800
                },
                {
                    "products": [
                        {
                            "discount": "上门拆旧装新调试",
                            "grey": false,
                            "itemIndex": 248,
                            "limitBuyNumber": "",
                            "limitBuyText": "",
                            "serviceSku": "100134318793",
                            "serviceSkuName": "3年免费换新",
                            "serviceSkuPrice": "175.00",
                            "tip": "免费换新，送上门服务",
                            "toastText": ""
                        },
                        {
                            "discount": "",
                            "grey": false,
                            "itemIndex": 270,
                            "limitBuyNumber": "",
                            "limitBuyText": "",
                            "serviceSku": "100044015298",
                            "serviceSkuName": "2年免费换新",
                            "serviceSkuPrice": "116.00",
                            "tip": "免费换新，送上门服务",
                            "toastText": ""
                        }
                    ],
                    "scIconUrl": "https://img10.360buyimg.com/imagetools/jfs/t1/216303/4/30395/8395/647567caFa1a4a1bb/f9fc94c77120a427.png",
                    "scId": 645,
                    "scName": "质保换新",
                    "scOrder": 20050
                },
                {
                    "products": [
                        {
                            "discount": "",
                            "grey": false,
                            "itemIndex": 71,
                            "limitBuyNumber": "",
                            "limitBuyText": "",
                            "serviceSku": "100038072994",
                            "serviceSkuName": "5年性能保修",
                            "serviceSkuPrice": "59.00",
                            "tip": "延长保修时间，性能故障免费维修",
                            "toastText": ""
                        },
                        {
                            "discount": "",
                            "grey": false,
                            "itemIndex": 87,
                            "limitBuyNumber": "",
                            "limitBuyText": "",
                         iceSku": "100038072912",
                            "serviceSkuName": "6年性能保修",
                            "serviceSkuPrice": "69.00",
                            "tip": "延长保修时间，性能故障免费维修",
                            "toastText": ""
                        }
                    ],
                    "scIconUrl": "https://img30.360buyimg.com/ling/jfs/t1/94829/13/24821/9973/626a49d7E9b3fbf00/0cab45d126f1a100.png",
                    "scId": 302,
                    "scName": "延长保修",
                    "scOrder": 20212
                },
                {
                    "products": [
                        {
                            "discount": "⭐享30%补贴",
                            "grey": false,
                            "itemIndex": 188,
                            "limitBuyNumber": "",
                            "limitBuyText": "",
                            "serviceSku": "100162170298",
                            "serviceSkuName": "3年复购补贴",
                            "serviceSkuPrice": "133.00",
                            "tip": "设备升级换新享大额补贴",
                            "toastText": ""
                        },
                        {
                            "discount": "",
                            "grey": false,
                            "itemIndex": 216,
                            "limitBuyNumber": "",
                            "limitBuyText": "",
                            "serviceSku": "100162170376",
                            "serviceSkuName": "4年复购补贴",
                            "serviceSkuPrice": "220.50",
                            "tip": "设备升级换新享大额补贴",
                            "toastText": ""
                        }
                    ],
                    "scIconUrl": "https://img30.360buyimg.com/vip/s80x80Jfs/t1/93653/27/32808/4901/6354a1baEc331048a/404b512fb114dd00.png",
                    "scId": 599,
                    "scName": "复购返现",
                    "scOrder": 20218
                },
                {
                    "products": [
                        {
                            "discount": "送首年只换不修",
                            "grey": false,
                            "itemIndex": 274,
                            "limitBuyNumber": "",
                            "limitBuyText": "",
                            "serviceSku": "100151169615",
                            "serviceSkuName": "30天试用",
                            "serviceSkuPrice": "130.00",
                            "tip": "30天无忧试用送首年质保换新",
                            "toastText": ""
                        },
                        {
                            "discount": "",
                            "grey": false,
                            "itemIndex": 282,
                            "limitBuyNumber": "",
                            "limitBuyText": "",
                            "serviceSku": "100191083194",
                            "serviceSkuName": "60天试用",
                            "serviceSkuPrice": "151.40",
                            "tip": "60天无忧试用送首年质保换新",
                            "toastText": ""
                        }
                    ],
                    "scIconUrl": "https://img10.360buyimg.com/imagetools/jfs/t1/216303/4/30395/8395/647567caFa1a4a1bb/f9fc94c77120a427.png",
                    "scId": 651,
                    "scName": "无忧试用",
                    "scOrder": 20225
                },
                {
                    "products": [
                        {
                            "discount": "♻️数据丢失无忧",
                            "grey": false,
                            "itemIndex": 230,
                            "limitBuyNumber": "",
                            "limitBuyText": "",
                            "serviceSku": "100024389319",
                            "suName": "1年数据恢复",
                            "serviceSkuPrice": "49.00",
                            "tip": "数据专家为你保驾护航",
                            "toastText": ""
                        },
                        {
                            "discount": "♻️数据丢失无忧",
                            "grey": false,
                            "itemIndex": 231,
                            "limitBuyNumber": "",
                            "limitBuyText": "",
              "serviceSku": "100024389355",
                            "serviceSkuName": "2年数据恢复",
                            "serviceSkuPrice": "79.00",
                            "tip": "数据专家为你保驾护航",
                            "toastText": ""
                        },
                        {
                            "discount": "♻️数据丢失无忧",
                            "grey": false,
                            "itemIndex": 232,
                            "l: "",
                            "limitBuyText": "",
                            "serviceSku": "100024389359",
                            "serviceSkuName": "3年数据恢复",
                            "serviceSkuPrice": "119.00",
                            "tip": "数据专家为你保驾护航",
                            "toastText": ""
                        }
                    ],
                    "scIconUrl": "https://img12.360buyimg.com/ling/jfs/t1/152564/37/17121/11836/601a7246E217513dd/72.png",
                    "scId": 601,
                    "scName": "数据恢复",
                    "scOrder": 37200
                }
            ],
            "title": "京选服务"
        },
        "serviceItems": []
    },
    "itemShopInfo": {
        "followCount": 2036319,
        "isYearFiveStarTab": false,
        "shopIconImg": "//img11.360buyimg.com/img/jfs/t1/273656/23/29811/731/681b1e9aF9ce3b5bc/6102ba8228118daf.png",
        "shopId": 1000075981,
        "shopLongLogo": "http://img30.360buyimg.com/popshop/jfs/t3166/352/2956906670/5071/5b544898/57ea1e04N827636b2.jpg",
        "shopName": "三星存储京东自营旗舰店",
        "shopTabList": [
            {
                "tabClassType": 1,
                "tabCode": "shop_var_redRect",
                "tabData": "9年老店",
                "tabDisplayType": 2,
                "tabImg": "http://m.360buyimg.com/cc/jfs/t1/157957/4/30960/453/63365fc4E1344bd4d/975c6f95c22fed20.png",
                "tabKey": "N_OLD_SHOP"
          ],
        "venderType": "1"
    },
    "govTextSwitch": true,
    "bybtInfo": {
        "ab": true,
        "bannerUrl": "//img30.360buyimg.com/jdg/jfs/t1/227337/19/23404/13151/66866ad1Fc54ecc63/1c639234e88ba342.png",
        "bbfc": false,
        "bbpbjc": false,
        "bybt": true,
        "compensateMultiple": "2",
        "doubleMgbp": true,
        "leftIcon": "",
        "link": "",
        "mgbp": true,
        "productBybt": true,
        "shield": false
    },
    "stockInfo": {
        "deliveryInfo": {
            "state": "SUPPORT",
            "support": true
        },
        "isPlus": false,
        "code": 1,
        "promiseInfoText": "23:10前付款，预计<b>明天(10月16日)</b>送达",
        "realStockState": "33",
        "promiseResult": "23:10前付款，预计<b>明天(10月16日)</b>送达",
        "serviceInfo": "由 <span class='hl_red'>京东</span> 发货, 供应商提供售后服务. ",
        "stockDesc": "<strong>有货</strong>",
        "fxgCode": "0",
        "is7ToReturn": "支持7天无理由退货",
        "stockState": 33,
        "stockInfo": {
            "ae": 0,
            "ag": "-1",
            "ah": -1,
            "at": "-1",
            "availableNum": -1,
            "businessType": 0,
            "ca": -1,
            "da": "-1",
            "date": "",
            "dc": "-1",
            "dcId": 3,
            "dcIdDely": 3,
            "ef": 0,
            "eh": -1,
            "ej": "-1",
            "ek": -1,
            "freshEdi": 0,
            "popPatType": -1,
            "preStore": -1,
            "railModel": 0,
            "reservationType": "OTHER",
            "rid": -1,
            "sidDely": 2281,
            "siteId4Dada": -1,
            "stDely": 0,
            "stockM": 0,
            "stockState": "AVAILABLE",
            "stockV": 0,
            "storeId": 2281,
            "storeId4Dada": -1,
            "storeState4Dada": -1,
            "storeType": 0,
            "useStockNum": 0
        },
        "supportHKMOShip": true,
        "serverIcon": {
            "basicNewIcons": [
                {
                    "helpLink": "https://pro.jd.com/mall/active/84x2kMhFsQJXq7jowBPDLKSLgsC/index.html?babelChannel=ttt17",
                    "text": "买贵双倍赔",
                    "tip": "买贵双倍赔"
                },
                {
                    "code": "free_baoyou",
                    "helpLink": "http://help.jd.com/user/issue/103-983.html",
                    "iconServiceType": 4,
                    "te "包邮",
                    "tip": "所选地址此商品无门槛包邮，免基础运费和续重运费。"
                },
                {
                    "code": "commonpd_distribution_global",
                    "text": "可配送全球",
                    "tip": "支持港澳台及海外收货地址下单，由于各地区政策不同，具体请以结算页详情为准"
                },
                {
                    "code": "s126",
                    "text": "正品行货带票",
                    "tip": "京东向您保证所售商品为正品行货，订单完成后均可开具正规发票。凭京东发票，可享受全国联保服务。"
                },
                {
                    "code": "s166",
                    "text": "90天只换不修",
                    "tip": "在商品签收后90天内，出现国家“三包”范围内的硬件性能故障，检测属实后可享一次换新服务。"
                },
                {
                    ",
                    "helpLink": "https://help.jd.com/user/issue/291-4537.html",
                    "text": "7天价保",
                    "tip": "在下单或签收7天内，商品出现降价可享受价保服务（商品在消费者下单后因参与百亿补贴、政府补贴等活动导致降价不支持价保），可点击“>”了解详细规则"
                },
                {
                    "code": "s115",
                    "text": "免费上门退换",
                    "tip":，选择上门取件优先安排京东物流服务，无需支付退换货运费；选择自寄，售后完成后补首重运费。"
                },
                {
                    "code": "s9",
                    "helpLink": "//help.jd.com/user/issue/942-1656.html",
                    "text": "上门换新",
                    "tip": "售后换货时，一次上门取旧送新，先发出新商品，快递员上门配送新商品的同时取回原商品。"
                },
                {                   "code": "s141",
                    "text": "供应商售后",
                    "tip": "由京东指定供应商提供售后服务"
                },
                {
                    "code": "s102",
                    "helpLink": "//help.jd.com/user/issue/942-3846.html",
                    "text": "五年质保",
                    "tip": "签收后的5年内，因商品质量问题可享受维修服务"
                },
                {
                    "code": "deliverrSales",
                    "text": "京东发货&供应商售后",
                    "tip": "京东发货&供应商售后"
                },
                {
                    "code": "old2new",
                    "helpLink": "//huishou.jd.com/huanxin?s=1&skuId=100153900833",
                    "text": "高价回收",
                    "tip": "购买新品时可同步进行闲置物品回收，将闲置物品卖了换钱用于消费或提现。"
                },
                {
                    "text": "支持7天无理由退货"
                }
            ],
            "wlfwIcons": [
                {
                    "code": "sendpay_zhun",
                    "helpLink": "//help.jd.com/user/issue/103-983.html",
                    "iconServiceType": 1,
                    "text": "京准达",
                    "tip": "选择京准达服务，可指定精确时间点收货；若京东责任超时，即时赔付"
                },
                {
                    "code": "sey_411",
                    "helpLink": "//help.jd.com/user/issue/103-983.html",
                    "iconServiceType": 1,
                    "text": "极速达",
                    "tip": "在08:00―20:00间下单，部分商品加收99元运费可享受2小时内送达服务"
                },
                {
                    "code": "service_jingzunda",
                    "helpLink": "https://help.jd.com/user/issue/936-3526.html",
                    "iconServiceType": 6,
                    "t尊达",
                    "tip": "轻奢尊贵礼遇的高端派送服务"
                },
                {
                    "code": "service_yysh",
                    "helpLink": "//help.jd.com/user/issue/103-983.html",
                    "iconServiceType": 6,
                    "text": "预约送货",
                    "tip": "京东物流为该商品提供预约送货服务"
                },
                {
                    "code": "service_bfsh",
                    "helpLink": "hthelp.jd.com/user/issue/103-983.html",
                    "iconServiceType": 6,
                    "text": "部分收货",
                    "tip": "如果收件人收货时发现部分货物存在缺少配件、物流损等情形，京东物流提供订单半收服务"
                },
                {
                    "code": "service_sssm",
                    "helpLink": "https://help.jd.com/user/issue/254-4130.html",
                    "iconServiceType": 6,
                    "text": "送货             "tip": "京东快递为您提供送货上门服务"
                },
                {
                    "code": "special_ziti",
                    "helpLink": "//help.jd.com/user/issue/103-983.html",
                    "iconServiceType": 5,
                    "text": "自提",
                    "tip": "我们提供多种自提服务，包括京东自提点、自助提货柜、京东校园派、京东星配站、京东便民站等服务"
                }
            ],
            "ba [
                {
                    "helpLink": "https://pro.jd.com/mall/active/84x2kMhFsQJXq7jowBPDLKSLgsC/index.html?babelChannel=ttt17",
                    "text": "买贵双倍赔",
                    "tip": "买贵双倍赔"
                },
                {
                    "code": "free_baoyou",
                    "helpLink": "http://help.jd.com/user/issue/103-983.html",
                    "iconServiceType": 4,
                    "text": "包邮",
                    "tip": "所选地费和续重运费。"
                },
                {
                    "code": "commonpd_distribution_global",
                    "text": "可配送全球",
                    "tip": "支持港澳台及海外收货地址下单，由于各地区政策不同，具体请以结算页详情为准"
                },
                {
                    "code": "s126",
                    "text": "正品行货带票",
                    "tip": "京东向您保证所售商品为正品行货，订单å均可开具正规发票。凭京东发票，可享受全国联保服务。"
                },
                {
                    "code": "s166",
                    "text": "90天只换不修",
                    "tip": "在商品签收后90天内，出现国家“三包”范围内的硬件性能故障，检测属实后可享一次换新服务。"
                },
                {
                    "code": "s26",
                    "helpLink": "https://help.jd.com/user/issue/291-4537.html",
                  "text": "7天价保",
                    "tip": "在下单或签收7天内，商品出现降价可享受价保服务（商品在消费者下单后因参与百亿补贴、政府补贴等活动导致降价不支持价保），可点击“>”了解详细规则"
                },
                {
                    "code": "s115",
                    "text": "免费上门退换",
                    "tip": "售后时效内申请退换货，选择上门取件优先安排京东物流服务ï¯付退换货运费；选择自寄，售后完成后补首重运费。"
                },
                {
                    "code": "s9",
                    "helpLink": "//help.jd.com/user/issue/942-1656.html",
                    "text": "上门换新",
                    "tip": "售后换货时，一次上门取旧送新，先发出新商品，快递员上门配送新商品的同时取回原商品。"
                },
                {
                    "code": "s141",
                    "te后",
                    "tip": "由京东指定供应商提供售后服务"
                },
                {
                    "code": "s102",
                    "helpLink": "//help.jd.com/user/issue/942-3846.html",
                    "text": "五年质保",
                    "tip": "签收后的5年内，因商品质量问题可享受维修服务"
                }
            ]
        },
        "support": [
            {
                "helpLink": "//huishou.jd.com/huanxin?s=1&skuId=100153900833",
                "showName": "高价回收，极速到账",
                "id": "old2new",
                "iconTip": "购买新品时可同步进行闲置物品回收，将闲置物品卖了换钱用于消费或提现。"
            }
        ],
        "isStock": true
    },
    "isSamMember": false,
    "limitBuyInfo": {},
    "isPlusMember": "4",
    "isJdkd": false,
    "isJdwl": true,
    "promotion": {
        "canReturnHaggleInfo": false,
        "isBargain": false,
        "isTwoLine": fa       "limitBuyInfo": {
            "limitNum": "1",
            "noSaleFlag": "0",
            "resultExt": {
                "noSaleFlag": "0",
                "limitNum": "1",
                "limitOrderNum": "1",
                "strategyFlag": "1",
                "canBuyPlusSku": "1",
                "limitUserFlag": "1",
                "mergeMaxBuyNumInfo": "{\"mergeMaxBuyNum\":1,\"strategyId\":3552206661,\"type\":2}",
                "sourceChannel": "ERP",
                "ruleTypeDesc": "每人æ¥下1单，最多可以购买1件，每单最多可以购买1件",
                "limitTotal": "1",
                "limitDay": "1",
                "limitPreOrderNum": "1",
                "peopleLimitCanBuyMap": "{\"20005\":{\"isLimit\":\"0\",\"canBuy\":\"1\"},\"20004\":{\"isLimit\":\"0\",\"canBuy\":\"1\"},\"20003\":{\"isLimit\":\"0\",\"canBuy\":\"1\"},\"20022\":{\"isLimit\":\"0\",\"canBuy\":\"1\"},\"20021\":{\"isLimit\":\"0\",\"canBuy\":\"1\"}}",
                "limitPeopleFlag": "1",
              yStrategyList": "[{\"limitValue\":\"3\",\"strategyName\":\"990pro9100pro限购-除8T\",\"limitOrderNum\":\"1\",\"limitTimeUnit\":\"1\",\"sourceChannel\":\"ERP\",\"gatherId\":\"100153900833\",\"gatherType\":\"sku\",\"limitTotal\":\"1\",\"limitDay\":\"1\",\"limitPreOrderNum\":\"1\",\"limitType\":\"0\",\"strategyId\":\"3552206661\",\"beginTime\":\"2025-10-11 17:22:41\",\"endTime\":\"2028-10-10 17:22:41\",\"everyoneSurplusNum\":\"1\"}]",
                "canBuy": "1",
                "limitText": "仅限购买1      "isPlusLimit": "0",
                "mergeMaxBuyNum": "1",
                "beginTime": "2025-10-11 17:22:41",
                "endTime": "2028-10-10 17:22:41",
                "isPaidMemberSku": "0",
                "limitAreaFlag": "1",
                "everyoneSurplusNum": "1"
            }
        },
        "prompt": ""
    },
    "tracerId": "10106524206-121356-1760537772555",
    "brandVipInfo": {
        "vip": false
    }
}



华佗牌针灸针承臻一次性针无菌针灸专用针医用中医针炙非银针
可开发票
216人评价"会回购"
超3万回头客
超2万人加购
券后
¥
16.8
起
超级立减活动价
¥
20.8
起
已售 40万+

全场立减
满300减30
超级立减4元



三星（SAMSUNG）2TB SSD固态硬盘 M.2接口(NVMe协议PCIe5.0*4)AI电脑配件 读速14700MB/S 9100 PRO
收藏
￥1599.00 补贴价 ￥1784.18 日常价累计评价 200万+降价通知
限购最高返79京豆

企业首购 部分满8000减400

固态硬盘热卖榜·第2名

錄入日期	名稱	品牌	產地	類型	單價（CNY）	數量	單位	價格（CNY）	優惠説明	優惠方	規格	要求	標準	測評	使用注意	備註	購買渠道


名稱	錄入日期	價格（CNY）	優惠説明	原價	購買渠道	作者	出版社	編輯	版權日期	版本	譯者	頁面	ISBN	開本	備註
