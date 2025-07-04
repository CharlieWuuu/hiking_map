import requests
from bs4 import BeautifulSoup
import time
import json
import os # 用於創建資料夾和處理檔案路徑

# 輔助函數：用於獲取完整 URL
def get_full_url(base_site_url, relative_url):
    """
    將相對 URL 轉換為絕對 URL。
    """
    if relative_url.startswith(('http://', 'https://')):
        return relative_url
    elif relative_url.startswith('//'):
        return "https:" + relative_url # 這裡假設網站是 HTTPS
    elif relative_url.startswith('/'):
        return base_site_url.rstrip('/') + relative_url
    else:
        return f"{base_site_url.rstrip('/')}/{relative_url}" # 處理更複雜的相對路徑


def find_button_href_and_download(detail_url, base_site_domain, download_folder="downloads"):
    """
    訪問詳細頁面，尋找特定按鈕的 href，並嘗試下載該檔案。
    """
    print(f"  > 正在訪問詳細頁面尋找下載按鈕: {detail_url}")
    downloaded_file_path = None

    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(detail_url, headers=headers, timeout=10)
        response.raise_for_status()
        response.encoding = 'utf-8'
        soup = BeautifulSoup(response.text, 'html.parser')

        # 使用 CSS 選擇器來找到目標按鈕
        # 假設按鈕是 <a> 標籤，並且 class 完全匹配 'btn btn-rect--xs btn--primary'
        # 如果是多個 class 且順序不固定，BeautifulSoup 推薦傳入 class 列表
        # 但在大多數情況下，單一字串匹配所有 class 即可
        button_element = soup.find('a', class_='btn btn-rect--xs btn--primary')

        if button_element:
            button_href = button_element.get('href')
            if button_href:
                full_download_url = get_full_url(base_site_domain, button_href)
                print(f"    - 找到下載連結: {full_download_url}")

                # 嘗試下載檔案
                downloaded_file_path = download_file(full_download_url, download_folder)
                return downloaded_file_path
            else:
                print("    - 找到按鈕，但其 href 屬性為空。")
        else:
            print("    - 未在詳細頁面找到指定的下載按鈕。")
        return None

    except requests.exceptions.RequestException as e:
        print(f"  > 訪問詳細頁面 {detail_url} 時發生錯誤: {e}")
        return None
    except Exception as e:
        print(f"  > 解析頁面或尋找按鈕時發生錯誤: {e}")
        return None

def download_file(url, folder="downloads"):
    """
    根據提供的 URL 下載檔案並保存到本地指定資料夾。
    """
    # 確保下載資料夾存在
    if not os.path.exists(folder):
        os.makedirs(folder)
        print(f"已創建下載資料夾: {folder}")

    # 從 URL 提取檔案名，或設置默認名稱
    filename_from_url = url.split('/')[-1] # 取 URL 最後一部分作為檔名
    if '?' in filename_from_url: # 移除可能的 URL 參數
        filename_from_url = filename_from_url.split('?')[0]

    # 處理沒有明確副檔名的情況，或設定一個合理的默認值
    if '.' not in filename_from_url or len(filename_from_url.split('.')[-1]) > 5: # 簡單判斷是否像副檔名
        filename_from_url = "downloaded_file" + str(time.time()).replace('.', '') # 使用時間戳作為唯一名稱

    file_path = os.path.join(folder, filename_from_url)

    print(f"    - 正在嘗試下載檔案: {url} 到 {file_path}")
    try:
        response = requests.get(url, stream=True, timeout=30)
        response.raise_for_status()

        with open(file_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        print(f"    - 檔案 '{file_path}' 下載成功！")
        return file_path
    except requests.exceptions.RequestException as e:
        print(f"    - 下載檔案 {url} 時發生錯誤: {e}")
        return None
    except Exception as e:
        print(f"    - 保存檔案時發生錯誤: {e}")
        return None

# 執行主程式
if __name__ == "__main__":
    # 您提供的 JSON 資料
    hundred_peaks_json_data = {
        "hundred": [
            {
                "title": "合歡北峰步道",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=288"
            },
            {
                "title": "合歡石門山步道",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=413"
            },
            {
                "title": "合歡東峰步道",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=287"
            },
            {
                "title": "合歡主峰步道",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=289"
            },
            {
                "title": "玉山主峰步道",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=299"
            },
            {
                "title": "雪山主東峰步道",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=431"
            },
            {
                "title": "奇萊南峰步道、南華山步道(奇萊南華) ",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=430"
            },
            {
                "title": "嘉明湖步道",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=347"
            },
            {
                "title": "北大武山步道",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=338"
            },
            {
                "title": "合歡西峰登山山徑(合歡北西)",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=536"
            },
            {
                "title": "大霸群峰登山步道(大鹿林道線)",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=242"
            },
            {
                "title": "玉山前峰登山山徑",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=1047"
            },
            {
                "title": "武陵四秀登山步道",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=540"
            },
            {
                "title": "桃山登山山徑",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=429"
            },
            {
                "title": "奇萊主山、奇萊北峰步道(奇萊主北)",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=542"
            },
            {
                "title": "郡大山、望鄉山登山步道",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=500"
            },
            {
                "title": "南湖群峰登山步道",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=547"
            },
            {
                "title": "畢祿山登山山徑",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=535"
            },
            {
                "title": "台灣池步道(合歡北峰+小溪營地+北峰名樹)",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=690"
            },
            {
                "title": "志佳陽大山登山步道",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=531"
            },
            {
                "title": "羊頭山登山山徑",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=482"
            },
            {
                "title": "西巒大山登山山徑",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=617"
            },
            {
                "title": "玉山西峰步道",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=1046"
            },
            {
                "title": "雪山下翠池",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=691"
            },
            {
                "title": "玉山前五峰登山步道",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=591"
            },
            {
                "title": "畢羊縱走(畢祿羊頭縱走)",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=655"
            },
            {
                "title": "玉山群峰線",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=621"
            },
            {
                "title": "屏風山登山山徑",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=656"
            },
            {
                "title": "白姑大山登山步道",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=653"
            },
            {
                "title": "閂山、鈴鳴山步道",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=532"
            },
            {
                "title": "雪山東峰登山山徑",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=1734"
            },
            {
                "title": "北三段(能高安東軍)",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=652"
            },
            {
                "title": "奇萊連峰登山步道",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=644"
            },
            {
                "title": "北一段(南湖、中央尖)",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=646"
            },
            {
                "title": "南二段",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=632"
            },
            {
                "title": "合歡西峰下華崗",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=1032"
            },
            {
                "title": "八大秀(八通關山、大水窟山、秀姑巒山)",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=623"
            },
            {
                "title": "天巒池下武法奈尾山出將軍廟",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=692"
            },
            {
                "title": "大霸北稜線",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=639"
            },
            {
                "title": "玉山後四峰登山步道",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=590"
            },
            {
                "title": "大小劍(大劍山、小劍山)",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=689"
            },
            {
                "title": "塔關山登山步道",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=1761"
            },
            {
                "title": "雪山西稜線",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=641"
            },
            {
                "title": "關山嶺山登山步道",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=1760"
            },
            {
                "title": "庫哈諾辛山登山步道",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=1762"
            },
            {
                "title": "聖稜線O型縱走(O聖)",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=636"
            },
            {
                "title": "武陵二秀(品田/池有)",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=1737"
            },
            {
                "title": "北二段",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=666"
            },
            {
                "title": "玉山主峰單日往返",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=1757"
            },
            {
                "title": "南一段",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=630"
            },
            {
                "title": "武陵二秀(桃山/喀拉業)",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=1746"
            },
            {
                "title": "奇萊東稜",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=643"
            },
            {
                "title": "秀霸線",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=637"
            },
            {
                "title": "干卓萬群峰線",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=881"
            },
            {
                "title": "馬博拉斯橫斷(馬博橫斷)",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=625"
            },
            {
                "title": "雪山主東峰單日往返",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=1735"
            },
            {
                "title": "北大武山單日往返",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=1750"
            },
            {
                "title": "新康橫斷出瓦拉米",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=631"
            },
            {
                "title": "雪劍線",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=640"
            },
            {
                "title": "八通關日治越道線",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=627"
            },
            {
                "title": "能高越嶺西段上卡賀爾、能高主峰",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=1507"
            },
            {
                "title": "南三段(丹大、東郡橫斷)",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=667"
            },
            {
                "title": "聖稜線I型縱走(I聖)",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=719"
            },
            {
                "title": "六順山、七彩湖登山步道（丹大進出）",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=1668"
            },
            {
                "title": "聖稜線Y型縱走(Y聖)",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=710"
            },
            {
                "title": "庫哈諾辛、關山線",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=1765"
            },
            {
                "title": "喀拉業山單日往返",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=1739"
            },
            {
                "title": "奇萊南峰步道、南華山步道(奇萊南華)單日往返",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=1768"
            },
            {
                "title": "屏風山單日往返",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=1769"
            },
            {
                "title": "品田山單日往返",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=1736"
            },
            {
                "title": "治茆山連走西巒大山、巒安堂",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=908"
            },
            {
                "title": "奇萊北壁下屏風山",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=1485"
            },
            {
                "title": "白姑大山單日往返",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=1770"
            },
            {
                "title": "小關山林道上小關山",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=1677"
            },
            {
                "title": "雪山主北下翠池",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=1738"
            },
            {
                "title": "嘉明湖單日往返",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=1771"
            },
            {
                "title": "大劍山線",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=1774"
            },
            {
                "title": "八通關上玉山(東埔進塔塔加出)",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=1756"
            },
            {
                "title": "六順山、七彩湖登山步道(萬榮進、丹大出)",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=1665"
            },
            {
                "title": "志佳陽雪山線",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=1689"
            },
            {
                "title": "閂山單日往返",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=1749"
            },
            {
                "title": "卯畢羊縱走(卯木山、畢祿山、羊頭山)",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=1839"
            },
            {
                "title": "中央尖、死亡稜線",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=1474"
            },
            {
                "title": "東埔上郡大下開高巷o型",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=1821"
            },
            {
                "title": "北一段縱走北二段",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=1759"
            },
            {
                "title": "楠梓仙溪上南玉山",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=1873"
            },
            {
                "title": "新康山線(向陽進出)",
                "url": "https://hiking.biji.co/index.php?q=trail&act=detail&id=1775"
            }
        ]
    }

    base_site_domain = "https://hiking.biji.co" # 網站的基礎域名，用於拼接相對路徑
    download_destination_folder = "biji_hiking_downloads" # 指定下載檔案的資料夾名稱

    print("--- 開始從提供的 JSON 資料中下載檔案 ---")

    if "hundred" in hundred_peaks_json_data and isinstance(hundred_peaks_json_data["hundred"], list):
        for item in hundred_peaks_json_data["hundred"]:
            if "url" in item and item["url"]:
                trail_title = item.get("title", "未知步道")
                detail_page_url = item["url"]

                print(f"\n處理步道: {trail_title} (URL: {detail_page_url})")

                # 尋找按鈕並下載
                downloaded_path = find_button_href_and_download(detail_page_url, base_site_domain, download_destination_folder)

                if downloaded_path:
                    print(f"  > '{trail_title}' 相關檔案已下載至: {downloaded_path}")
                else:
                    print(f"  > 未能下載 '{trail_title}' 的相關檔案。")

                time.sleep(2) # 每個詳細頁面處理完畢後，增加延遲
            else:
                print(f"  - 警告：JSON 中有條目缺少 'url'：{item}")
    else:
        print("提供的 JSON 資料格式不正確，找不到 'hundred' 列表。")

    print("\n--- 所有檔案處理完成 ---")
