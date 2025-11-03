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

parse product info button $1
jd info formats and calibration $28.87
JD product parser extract brand name $9.26
larger window $0.1556
fix discount parser $4.71
parse specification with line break $0.69
specification parse default order $4.01
remember column controller settings $0.2876
~~don't restart on Windows~~ ✅ FIXED - Database moved to app data directory $0.64+$4.65+$2.87
make specification collapsible $0.4071
unit price $32.93 $5.74 $3.84
parse specification from taobao product information $3.88 $6.97 $2.27
parse specification from JD product information $26.78
click to open a modal to show the whole specification $1.28 
copy text: https://api.m.jd.com/?appid=pc-item-soa& $2.60
specification template
chart filter by date
parse and fill the amount and unit $4.34
select unit and select comparison unit as well $2.25
UT $0.56
the page size persistence feature for the ProductTable $0.0257
remove tags from the brand and category columns $0.0188
db is configurable $0.2208

page width $0.0111

order history and evaluation

update export and import 
export show download location
export select downlaod location




錄入日期	名稱	品牌	產地	類型	單價（CNY）	數量	單位	價格（CNY）	優惠説明	優惠方	規格	要求	標準	測評	使用注意	備註	購買渠道


名稱	錄入日期	價格（CNY）	優惠説明	原價	購買渠道	作者	出版社	編輯	版權日期	版本	譯者	頁面	ISBN	開本	備註

