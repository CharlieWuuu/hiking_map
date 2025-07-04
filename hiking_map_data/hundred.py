import requests
from bs4 import BeautifulSoup
import time # 用於設定延遲，避免過快請求
import json # 用於處理 JSON 檔案

# 輔助函數：用於獲取完整 URL
def get_full_url(base_site_url, relative_url):
    """
    將相對 URL 轉換為絕對 URL。
    確保 base_site_url 最後沒有斜槓，除非是根目錄本身。
    """
    if relative_url.startswith(('http://', 'https://')):
        return relative_url
    elif relative_url.startswith('//'):
        return "https:" + relative_url # 這裡假設網站是 HTTPS
    elif relative_url.startswith('/'):
        return base_site_url.rstrip('/') + relative_url
    else:
        # 處理其他相對路徑，可能需要更複雜的邏輯
        return f"{base_site_url.rstrip('/')}/{relative_url}"


def crawl_biji_hiking_hundred_peaks():
    """
    1. 前往 https://hiking.biji.co/index.php?q=trail&type=%E7%99%BE%E5%B2%B3&filter=1&page={number}
    2. 尋找 class='text-current' 的 title 與 href
    3. 爬取期間將資料儲存在一個列表中
    4. 當頁面中沒有 text-current 元素時，停止爬取
    5. 將結果以 {hundred:[{title:"",url:""},{...}]} 格式存為 JSON
    """
    base_listing_url = "https://hiking.biji.co/index.php?q=trail&type=%E7%99%BE%E5%B2%B3&filter=1&page="
    base_site_domain = "https://hiking.biji.co" # 網站的基礎域名，用於拼接相對路徑
    page_num = 1

    # 儲存最終要輸出到 JSON 的資料
    # 結構將是 [{title:"", url:""}, ...]
    hundred_peaks_data = []

    while True:
        url = f"{base_listing_url}{page_num}"
        print(f"正在爬取頁面: {url}")

        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status() # 如果請求失敗，會拋出異常
            response.encoding = 'utf-8'

            soup = BeautifulSoup(response.text, 'html.parser')

            # 找到所有 class 為 'text-current' 的 <a> 標籤
            # 這應該就是每個步道的標題連結
            current_elements = soup.select('.truncate > a.text-current')

            # 判斷是否還有 text-current 元素，如果沒有則停止
            if not current_elements:
                print(f"在頁面 {page_num} 中未找到 'truncate > a.text-current' 模式的元素，停止爬取。")
                break

            for element in current_elements:
                title = element.get('title') # 獲取 title 屬性
                href = element.get('href')   # 獲取 href 屬性

                if title and href: # 確保 title 和 href 都存在
                    full_url = get_full_url(base_site_domain, href)
                    hundred_peaks_data.append({
                        'title': title,
                        'url': full_url
                    })
                    print(f"  - 找到：Title: {title}, URL: {full_url}")
                else:
                    print(f"  - 警告：找到一個 'text-current' 元素但缺少 title 或 href：{element}")


            page_num += 1
            time.sleep(2) # 建議每次請求間隔 2 秒，避免對伺服器造成過大壓力或被偵測

        except requests.exceptions.RequestException as e:
            print(f"請求頁面 {url} 時發生錯誤: {e}")
            break # 發生錯誤時停止爬取
        except Exception as e:
            print(f"解析頁面 {url} 時發生錯誤: {e}")
            break

    return hundred_peaks_data

# 執行爬蟲
if __name__ == "__main__":
    print("--- 開始爬取資料 ---")
    extracted_data = crawl_biji_hiking_hundred_peaks()

    print("\n--- 爬取完成 ---")
    if extracted_data:
        print(f"共爬取到 {len(extracted_data)} 條資料。")

        # 按照指定的 JSON 結構打包資料
        final_json_output = {
            "hundred": extracted_data
        }

        # 定義 JSON 檔案名
        json_filename = "biji_hiking_hundred_peaks.json"

        # 將資料儲存為 JSON 檔案
        try:
            with open(json_filename, 'w', encoding='utf-8') as f:
                # ensure_ascii=False 確保中文字符正確顯示，indent=4 讓 JSON 格式更易讀
                json.dump(final_json_output, f, ensure_ascii=False, indent=4)
            print(f"資料已成功儲存到 {json_filename}")
        except Exception as e:
            print(f"儲存 JSON 檔案時發生錯誤: {e}")

    else:
        print("未爬取到任何資料。")
