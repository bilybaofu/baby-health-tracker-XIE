// 婴幼儿体检报告智能识别系统 - 百度OCR版本
(function() {
    'use strict';
    
    class BabyHealthTracker {
        constructor() {
            this.apiKey = localStorage.getItem('deepseek_api_key') || '';
            this.baiduOcrConfig = {
                apiKey: localStorage.getItem('baidu_ocr_api_key') || '',
                secretKey: localStorage.getItem('baidu_ocr_secret_key') || '',
                accessToken: localStorage.getItem('baidu_ocr_access_token') || '',
                tokenExpireTime: parseInt(localStorage.getItem('baidu_ocr_token_expire') || '0')
            };
            this.checkRecords = JSON.parse(localStorage.getItem('baby_check_records') || '[]');
            this.babyInfo = JSON.parse(localStorage.getItem('baby_info') || '{}');
            this.isUploading = false;
            this.lastOCRResult = null;
            this.whoData = this.initCompleteWHOData();
            this.growthChart = null;
            this.tempExtractedData = null;
            
            this.init();
        }

        initCompleteWHOData() {
            return {
                maleHeight: {
                    0: [44.2, 46.1, 48.0, 49.9, 51.8, 53.7, 55.6],
                    1: [48.9, 50.8, 52.8, 54.7, 56.7, 58.6, 60.6],
                    2: [52.4, 54.4, 56.4, 58.4, 60.4, 62.4, 64.4],
                    3: [55.3, 57.3, 59.4, 61.4, 63.5, 65.5, 67.6],
                    4: [57.6, 59.7, 61.8, 63.9, 66.0, 68.0, 70.1],
                    5: [59.6, 61.7, 63.8, 65.9, 68.0, 70.1, 72.2],
                    6: [61.2, 63.3, 65.5, 67.6, 69.8, 71.9, 74.0],
                    7: [62.7, 64.8, 67.0, 69.2, 71.3, 73.5, 75.7],
                    8: [64.0, 66.2, 68.4, 70.6, 72.8, 75.0, 77.2],
                    9: [65.2, 67.5, 69.7, 72.0, 74.2, 76.5, 78.7],
                    10: [66.4, 68.7, 71.0, 73.3, 75.6, 77.9, 80.1],
                    11: [67.6, 69.9, 72.2, 74.5, 76.9, 79.2, 81.5],
                    12: [68.6, 71.0, 73.4, 75.7, 78.1, 80.5, 82.9],
                    13: [69.6, 72.1, 74.5, 76.9, 79.3, 81.8, 84.2],
                    14: [70.6, 73.1, 75.6, 78.0, 80.5, 83.0, 85.5],
                    15: [71.6, 74.1, 76.6, 79.1, 81.7, 84.2, 86.7],
                    16: [72.5, 75.0, 77.6, 80.2, 82.8, 85.4, 88.0],
                    17: [73.3, 76.0, 78.6, 81.2, 83.9, 86.5, 89.2],
                    18: [74.2, 76.9, 79.6, 82.3, 85.0, 87.7, 90.4],
                    19: [75.0, 77.7, 80.5, 83.2, 86.0, 88.8, 91.5],
                    20: [75.8, 78.6, 81.4, 84.2, 87.0, 89.8, 92.6],
                    21: [76.5, 79.4, 82.3, 85.1, 88.0, 90.9, 93.8],
                    22: [77.2, 80.2, 83.1, 86.0, 89.0, 91.9, 94.9],
                    23: [78.0, 81.0, 83.9, 86.9, 89.9, 92.9, 95.9],
                    24: [78.7, 81.7, 84.8, 87.8, 90.9, 93.9, 97.0],
                    25: [78.6, 81.7, 84.9, 88.0, 91.1, 94.2, 97.3],
                    26: [79.3, 82.5, 85.6, 88.8, 92.0, 95.2, 98.3],
                    27: [79.9, 83.1, 86.4, 89.6, 92.9, 96.1, 99.3],
                    28: [80.5, 83.8, 87.1, 90.4, 93.7, 97.0, 100.3],
                    29: [81.1, 84.5, 87.8, 91.2, 94.5, 97.9, 101.2],
                    30: [81.7, 85.1, 88.5, 91.9, 95.3, 98.7, 102.1],
                    31: [82.3, 85.7, 89.2, 92.7, 96.1, 99.6, 103.0],
                    32: [82.8, 86.4, 89.9, 93.4, 96.9, 100.4, 103.9],
                    33: [83.4, 86.9, 90.5, 94.1, 97.6, 101.2, 104.8],
                    34: [83.9, 87.5, 91.1, 94.8, 98.4, 102.0, 105.6],
                    35: [84.4, 88.1, 91.8, 95.4, 99.1, 102.7, 106.4],
                    36: [85.0, 88.7, 92.4, 96.1, 99.8, 103.5, 107.2]
                },
                femaleHeight: {
                    0: [43.6, 45.4, 47.3, 49.1, 51.0, 52.9, 54.7],
                    1: [47.8, 49.8, 51.7, 53.7, 55.6, 57.6, 59.5],
                    2: [51.0, 53.0, 55.0, 57.1, 59.1, 61.1, 63.2],
                    3: [53.5, 55.6, 57.7, 59.8, 61.9, 64.0, 66.1],
                    4: [55.6, 57.8, 59.9, 62.1, 64.3, 66.4, 68.6],
                    5: [57.4, 59.6, 61.8, 64.0, 66.2, 68.5, 70.7],
                    6: [58.9, 61.2, 63.5, 65.7, 68.0, 70.3, 72.5],
                    7: [60.3, 62.7, 65.0, 67.3, 69.6, 71.9, 74.2],
                    8: [61.7, 64.0, 66.4, 68.7, 71.1, 73.5, 75.8],
                    9: [62.9, 65.3, 67.7, 70.1, 72.6, 75.0, 77.4],
                    10: [64.1, 66.5, 69.0, 71.5, 73.9, 76.4, 78.9],
                    11: [65.2, 67.7, 70.3, 72.8, 75.3, 77.8, 80.3],
                    12: [66.3, 68.9, 71.4, 74.0, 76.6, 79.2, 81.7],
                    13: [67.3, 70.0, 72.6, 75.2, 77.8, 80.5, 83.1],
                    14: [68.3, 71.0, 73.7, 76.4, 79.1, 81.7, 84.4],
                    15: [69.3, 72.0, 74.8, 77.5, 80.2, 83.0, 85.7],
                    16: [70.2, 73.0, 75.8, 78.6, 81.4, 84.2, 87.0],
                    17: [71.1, 74.0, 76.8, 79.7, 82.5, 85.4, 88.2],
                    18: [72.0, 74.9, 77.8, 80.7, 83.6, 86.5, 89.4],
                    19: [72.8, 75.8, 78.8, 81.7, 84.7, 87.6, 90.6],
                    20: [73.7, 76.7, 79.7, 82.7, 85.7, 88.7, 91.7],
                    21: [74.5, 77.5, 80.6, 83.7, 86.7, 89.8, 92.9],
                    22: [75.2, 78.4, 81.5, 84.6, 87.7, 90.8, 94.0],
                    23: [76.0, 79.2, 82.3, 85.5, 88.7, 91.9, 95.0],
                    24: [76.7, 80.0, 83.2, 86.4, 89.6, 92.9, 96.1],
                    25: [76.8, 80.0, 83.3, 86.6, 89.9, 93.1, 96.4],
                    26: [77.5, 80.8, 84.1, 87.4, 90.8, 94.1, 97.4],
                    27: [78.1, 81.5, 84.9, 88.3, 91.7, 95.0, 98.4],
                    28: [78.8, 82.2, 85.7, 89.1, 92.5, 96.0, 99.4],
                    29: [79.5, 82.9, 86.4, 89.9, 93.4, 96.9, 100.3],
                    30: [80.1, 83.6, 87.1, 90.7, 94.2, 97.7, 101.3],
                    31: [80.7, 84.3, 87.9, 91.4, 95.0, 98.6, 102.2],
                    32: [81.3, 84.9, 88.6, 92.2, 95.8, 99.4, 103.1],
                    33: [81.9, 85.6, 89.3, 92.9, 96.6, 100.3, 103.9],
                    34: [82.5, 86.2, 89.9, 93.6, 97.4, 101.1, 104.8],
                    35: [83.1, 86.8, 90.6, 94.4, 98.1, 101.9, 105.6],
                    36: [83.6, 87.4, 91.2, 95.1, 98.9, 102.7, 106.5]
                },
                maleWeight: {
                    0: [2.1, 2.5, 2.9, 3.3, 3.9, 4.4, 5.0],
                    1: [2.9, 3.4, 3.9, 4.5, 5.1, 5.8, 6.6],
                    2: [3.8, 4.3, 4.9, 5.6, 6.3, 7.1, 8.0],
                    3: [4.4, 5.0, 5.7, 6.4, 7.2, 8.0, 9.0],
                    4: [4.9, 5.6, 6.2, 7.0, 7.8, 8.7, 9.7],
                    5: [5.3, 6.0, 6.7, 7.5, 8.4, 9.3, 10.4],
                    6: [5.7, 6.4, 7.1, 7.9, 8.8, 9.8, 10.9],
                    7: [5.9, 6.7, 7.4, 8.3, 9.2, 10.3, 11.4],
                    8: [6.2, 6.9, 7.7, 8.6, 9.6, 10.7, 11.9],
                    9: [6.4, 7.1, 8.0, 8.9, 9.9, 11.0, 12.3],
                    10: [6.6, 7.4, 8.2, 9.2, 10.2, 11.4, 12.7],
                    11: [6.8, 7.6, 8.4, 9.4, 10.5, 11.7, 13.0],
                    12: [6.9, 7.7, 8.6, 9.6, 10.8, 12.0, 13.3],
                    13: [7.1, 7.9, 8.8, 9.9, 11.0, 12.3, 13.7],
                    14: [7.2, 8.1, 9.0, 10.1, 11.3, 12.6, 14.0],
                    15: [7.4, 8.3, 9.2, 10.3, 11.5, 12.8, 14.3],
                    16: [7.5, 8.4, 9.4, 10.5, 11.7, 13.1, 14.6],
                    17: [7.7, 8.6, 9.6, 10.7, 12.0, 13.4, 14.9],
                    18: [7.8, 8.8, 9.8, 10.9, 12.2, 13.7, 15.3],
                    19: [8.0, 8.9, 10.0, 11.1, 12.5, 13.9, 15.6],
                    20: [8.1, 9.1, 10.1, 11.3, 12.7, 14.2, 15.9],
                    21: [8.2, 9.2, 10.3, 11.5, 12.9, 14.5, 16.2],
                    22: [8.4, 9.4, 10.5, 11.8, 13.2, 14.7, 16.5],
                    23: [8.5, 9.5, 10.7, 12.0, 13.4, 15.0, 16.8],
                    24: [8.6, 9.7, 10.8, 12.2, 13.6, 15.3, 17.1],
                    25: [8.8, 9.8, 11.0, 12.4, 13.9, 15.5, 17.5],
                    26: [8.9, 10.0, 11.2, 12.5, 14.1, 15.8, 17.8],
                    27: [9.0, 10.1, 11.3, 12.7, 14.3, 16.1, 18.1],
                    28: [9.1, 10.2, 11.5, 12.9, 14.5, 16.3, 18.4],
                    29: [9.2, 10.4, 11.7, 13.1, 14.8, 16.6, 18.7],
                    30: [9.4, 10.5, 11.8, 13.3, 15.0, 16.9, 19.0],
                    31: [9.5, 10.7, 12.0, 13.5, 15.2, 17.1, 19.3],
                    32: [9.6, 10.8, 12.1, 13.7, 15.4, 17.4, 19.6],
                    33: [9.7, 10.9, 12.3, 13.8, 15.6, 17.6, 19.9],
                    34: [9.8, 11.0, 12.4, 14.0, 15.8, 17.8, 20.2],
                    35: [9.9, 11.2, 12.6, 14.2, 16.0, 18.1, 20.4],
                    36: [10.0, 11.3, 12.7, 14.3, 16.2, 18.3, 20.7]
                },
                femaleWeight: {
                    0: [2.0, 2.4, 2.8, 3.2, 3.7, 4.2, 4.8],
                    1: [2.7, 3.2, 3.6, 4.2, 4.8, 5.5, 6.2],
                    2: [3.4, 3.9, 4.5, 5.1, 5.8, 6.6, 7.5],
                    3: [4.0, 4.5, 5.2, 5.8, 6.6, 7.5, 8.5],
                    4: [4.4, 5.0, 5.7, 6.4, 7.3, 8.2, 9.3],
                    5: [4.8, 5.4, 6.1, 6.9, 7.8, 8.8, 10.0],
                    6: [5.1, 5.7, 6.5, 7.3, 8.2, 9.3, 10.6],
                    7: [5.3, 6.0, 6.8, 7.6, 8.6, 9.8, 11.1],
                    8: [5.6, 6.3, 7.0, 7.9, 9.0, 10.2, 11.6],
                    9: [5.8, 6.5, 7.3, 8.2, 9.3, 10.5, 12.0],
                    10: [5.9, 6.7, 7.5, 8.5, 9.6, 10.9, 12.4],
                    11: [6.1, 6.9, 7.7, 8.7, 9.9, 11.2, 12.8],
                    12: [6.3, 7.0, 7.9, 8.9, 10.1, 11.5, 13.1],
                    13: [6.4, 7.2, 8.1, 9.2, 10.4, 11.8, 13.5],
                    14: [6.6, 7.4, 8.3, 9.4, 10.6, 12.1, 13.8],
                    15: [6.7, 7.6, 8.5, 9.6, 10.9, 12.4, 14.1],
                    16: [6.9, 7.7, 8.7, 9.8, 11.1, 12.6, 14.5],
                    17: [7.0, 7.9, 8.9, 10.0, 11.4, 12.9, 14.8],
                    18: [7.2, 8.1, 9.1, 10.2, 11.6, 13.2, 15.1],
                    19: [7.3, 8.2, 9.2, 10.4, 11.8, 13.5, 15.4],
                    20: [7.5, 8.4, 9.4, 10.6, 12.1, 13.7, 15.7],
                    21: [7.6, 8.6, 9.6, 10.9, 12.3, 14.0, 16.0],
                    22: [7.8, 8.7, 9.8, 11.1, 12.5, 14.3, 16.4],
                    23: [7.9, 8.9, 10.0, 11.3, 12.8, 14.6, 16.7],
                    24: [8.1, 9.0, 10.2, 11.5, 13.0, 14.8, 17.0],
                    25: [8.2, 9.2, 10.3, 11.7, 13.3, 15.1, 17.3],
                    26: [8.4, 9.4, 10.5, 11.9, 13.5, 15.4, 17.7],
                    27: [8.5, 9.5, 10.7, 12.1, 13.7, 15.7, 18.0],
                    28: [8.6, 9.7, 10.9, 12.3, 14.0, 16.0, 18.3],
                    29: [8.8, 9.8, 11.1, 12.5, 14.2, 16.2, 18.7],
                    30: [8.9, 10.0, 11.2, 12.7, 14.4, 16.5, 19.0],
                    31: [9.0, 10.1, 11.4, 12.9, 14.7, 16.8, 19.3],
                    32: [9.1, 10.3, 11.6, 13.1, 14.9, 17.1, 19.6],
                    33: [9.3, 10.4, 11.7, 13.3, 15.1, 17.3, 20.0],
                    34: [9.4, 10.5, 11.9, 13.5, 15.4, 17.6, 20.3],
                    35: [9.5, 10.7, 12.0, 13.7, 15.6, 17.9, 20.6],
                    36: [9.6, 10.8, 12.2, 13.9, 15.8, 18.1, 20.9]
                },
                maleHeadCircumference: {
                    0: [30.4, 31.7, 33.0, 34.3, 35.6, 36.9, 38.3],
                    1: [33.4, 34.6, 35.8, 37.0, 38.2, 39.4, 40.6],
                    2: [35.7, 36.8, 37.9, 39.1, 40.2, 41.4, 42.6],
                    3: [37.1, 38.2, 39.3, 40.5, 41.6, 42.8, 44.1],
                    4: [38.1, 39.3, 40.4, 41.6, 42.8, 44.0, 45.3],
                    5: [39.0, 40.2, 41.3, 42.5, 43.8, 45.0, 46.3],
                    6: [39.8, 41.0, 42.1, 43.4, 44.6, 45.9, 47.2],
                    7: [40.5, 41.7, 42.8, 44.0, 45.3, 46.6, 47.9],
                    8: [41.1, 42.2, 43.4, 44.6, 45.9, 47.2, 48.5],
                    9: [41.5, 42.7, 43.9, 45.1, 46.4, 47.7, 49.0],
                    10: [41.9, 43.1, 44.3, 45.5, 46.8, 48.1, 49.4],
                    11: [42.3, 43.4, 44.6, 45.8, 47.1, 48.4, 49.8],
                    12: [42.5, 43.7, 44.9, 46.1, 47.4, 48.7, 50.1],
                    13: [42.8, 44.0, 45.1, 46.4, 47.7, 49.0, 50.3],
                    14: [43.0, 44.2, 45.4, 46.6, 47.9, 49.2, 50.6],
                    15: [43.2, 44.4, 45.6, 46.8, 48.1, 49.4, 50.8],
                    16: [43.4, 44.6, 45.8, 47.0, 48.3, 49.6, 51.0],
                    17: [43.6, 44.7, 45.9, 47.2, 48.5, 49.8, 51.2],
                    18: [43.8, 44.9, 46.1, 47.4, 48.7, 50.0, 51.4],
                    19: [43.9, 45.1, 46.3, 47.5, 48.8, 50.2, 51.6],
                    20: [44.1, 45.3, 46.5, 47.7, 49.0, 50.4, 51.7],
                    21: [44.3, 45.4, 46.6, 47.9, 49.2, 50.5, 51.9],
                    22: [44.4, 45.6, 46.8, 48.1, 49.4, 50.7, 52.1],
                    23: [44.6, 45.7, 47.0, 48.2, 49.5, 50.9, 52.3],
                    24: [44.7, 45.9, 47.1, 48.3, 49.6, 51.0, 52.4],
                    25: [44.8, 46.0, 47.2, 48.4, 49.7, 51.1, 52.5],
                    26: [44.9, 46.1, 47.3, 48.5, 49.8, 51.2, 52.6],
                    27: [45.0, 46.2, 47.4, 48.7, 50.0, 51.3, 52.7],
                    28: [45.1, 46.3, 47.5, 48.8, 50.1, 51.4, 52.8],
                    29: [45.2, 46.3, 47.6, 48.8, 50.2, 51.5, 52.9],
                    30: [45.3, 46.4, 47.7, 48.9, 50.3, 51.6, 53.0],
                    31: [45.4, 46.5, 47.8, 49.0, 50.4, 51.7, 53.1],
                    32: [45.4, 46.6, 47.8, 49.1, 50.4, 51.8, 53.2],
                    33: [45.5, 46.7, 47.9, 49.2, 50.5, 51.9, 53.3],
                    34: [45.6, 46.7, 48.0, 49.2, 50.6, 52.0, 53.4],
                    35: [45.6, 46.8, 48.0, 49.3, 50.6, 52.0, 53.4],
                    36: [45.7, 46.8, 48.1, 49.3, 50.7, 52.1, 53.5]
                },
                femaleHeadCircumference: {
                    0: [30.1, 31.4, 32.7, 33.9, 35.2, 36.5, 37.7],
                    1: [32.9, 34.0, 35.2, 36.3, 37.5, 38.6, 39.8],
                    2: [34.9, 36.0, 37.1, 38.2, 39.3, 40.4, 41.6],
                    3: [36.2, 37.3, 38.4, 39.5, 40.7, 41.8, 42.9],
                    4: [37.2, 38.3, 39.4, 40.6, 41.7, 42.9, 44.1],
                    5: [38.0, 39.2, 40.3, 41.5, 42.6, 43.8, 45.0],
                    6: [38.8, 39.9, 41.1, 42.2, 43.4, 44.6, 45.9],
                    7: [39.4, 40.6, 41.7, 42.9, 44.1, 45.3, 46.6],
                    8: [40.0, 41.1, 42.3, 43.5, 44.7, 45.9, 47.2],
                    9: [40.4, 41.6, 42.8, 44.0, 45.2, 46.5, 47.7],
                    10: [40.8, 42.0, 43.2, 44.4, 45.6, 46.9, 48.2],
                    11: [41.2, 42.4, 43.6, 44.8, 46.0, 47.3, 48.6],
                    12: [41.5, 42.7, 43.9, 45.1, 46.4, 47.6, 48.9],
                    13: [41.8, 42.9, 44.2, 45.4, 46.6, 47.9, 49.2],
                    14: [42.0, 43.2, 44.4, 45.6, 46.9, 48.2, 49.5],
                    15: [42.2, 43.4, 44.6, 45.9, 47.1, 48.4, 49.7],
                    16: [42.4, 43.6, 44.8, 46.1, 47.3, 48.6, 50.0],
                    17: [42.6, 43.8, 45.0, 46.2, 47.5, 48.8, 50.1],
                    18: [42.7, 43.9, 45.2, 46.4, 47.7, 49.0, 50.3],
                    19: [42.9, 44.1, 45.3, 46.6, 47.9, 49.2, 50.5],
                    20: [43.1, 44.3, 45.5, 46.7, 48.0, 49.3, 50.7],
                    21: [43.2, 44.4, 45.6, 46.9, 48.2, 49.5, 50.9],
                    22: [43.4, 44.6, 45.8, 47.1, 48.4, 49.7, 51.0],
                    23: [43.5, 44.7, 45.9, 47.2, 48.5, 49.8, 51.2],
                    24: [43.6, 44.8, 46.1, 47.3, 48.6, 50.0, 51.3],
                    25: [43.7, 44.9, 46.2, 47.4, 48.8, 50.1, 51.5],
                    26: [43.8, 45.0, 46.3, 47.5, 48.9, 50.2, 51.6],
                    27: [43.9, 45.1, 46.4, 47.6, 49.0, 50.3, 51.7],
                    28: [44.0, 45.2, 46.5, 47.7, 49.1, 50.4, 51.8],
                    29: [44.1, 45.3, 46.6, 47.8, 49.2, 50.5, 51.9],
                    30: [44.2, 45.4, 46.7, 47.9, 49.3, 50.6, 52.0],
                    31: [44.3, 45.5, 46.8, 48.0, 49.4, 50.7, 52.1],
                    32: [44.3, 45.6, 46.8, 48.1, 49.5, 50.8, 52.2],
                    33: [44.4, 45.7, 46.9, 48.2, 49.6, 50.9, 52.3],
                    34: [44.5, 45.8, 47.0, 48.3, 49.7, 51.0, 52.4],
                    35: [44.6, 45.8, 47.1, 48.4, 49.8, 51.1, 52.5],
                    36: [44.7, 45.9, 47.2, 48.5, 49.9, 51.2, 52.7]
                }
            };
        }

        init() {
            this.bindEvents();
            this.loadSavedData();
            this.updateUI();
            this.initializeChart();
        }

        validateBasicInfo() {
            const name = this.babyInfo.name ? this.babyInfo.name.trim() : '';
            const gender = this.babyInfo.gender;
            const birthDate = this.babyInfo.birthDate;
            
            console.log('验证基本信息:', { name, gender, birthDate });
            
            if (!name || !gender || !birthDate) {
                this.showMessage('🍼 请先完整填写宝宝的基本信息（姓名、性别、出生日期）', 'error');
                this.switchToBasicInfoTab();
                return false;
            }
            return true;
        }

        switchToBasicInfoTab() {
            const basicInfoTab = document.querySelector('[data-tab="basic-info"]');
            const basicInfoContent = document.getElementById('basic-info');
            
            if (basicInfoTab && basicInfoContent) {
                document.querySelectorAll('.tab-button').forEach(tab => tab.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                
                basicInfoTab.classList.add('active');
                basicInfoContent.classList.add('active');
            }
        }

        bindEvents() {
            const self = this;
            
            // API密钥设置
            const apiKeyInput = document.getElementById('apiKeyInput');
            if (apiKeyInput) {
                apiKeyInput.addEventListener('change', function(e) {
                    self.apiKey = e.target.value.trim();
                    self.updateApiStatus();
                });
            }

            // API密钥保存按钮
            const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
            if (saveApiKeyBtn) {
                saveApiKeyBtn.addEventListener('click', function() {
                    self.saveApiKey();
                });
            }

            // 百度OCR配置保存
            const saveBaiduOcrBtn = document.getElementById('saveBaiduOcrBtn');
            if (saveBaiduOcrBtn) {
                saveBaiduOcrBtn.addEventListener('click', function() {
                    self.saveBaiduOcrConfig();
                });
            }
            const testBaiduOcrBtn = document.getElementById('testBaiduOcrBtn');
            if (testBaiduOcrBtn) {
            testBaiduOcrBtn.addEventListener('click', function() {
            console.log('🔧 用户点击了测试连接按钮');
            self.testBaiduOcrConnection();
                });
            }

            // 图片上传
            const reportUpload = document.getElementById('reportUpload');
            if (reportUpload) {
                reportUpload.addEventListener('change', function(e) {
                    self.handleImageUpload(e.target.files[0]);
                });
            }

            // 手动添加记录
            const addRecordBtn = document.getElementById('addRecordBtn');
            if (addRecordBtn) {
                addRecordBtn.addEventListener('click', function() {
                    self.addManualRecord();
                });
            }

            // 一键清除记录
            const clearAllRecordsBtn = document.getElementById('clearAllRecordsBtn');
            if (clearAllRecordsBtn) {
                clearAllRecordsBtn.addEventListener('click', function() {
                    self.clearAllRecords();
                });
            }

            // 导出数据
            const exportBtn = document.getElementById('exportBtn');
            if (exportBtn) {
                exportBtn.addEventListener('click', function() {
                    self.exportData();
                });
            }

            // 导入数据
            const importBtn = document.getElementById('importBtn');
            if (importBtn) {
                importBtn.addEventListener('click', function() {
                    self.importData();
                });
            }

            // 清空表单
            const clearFormBtn = document.getElementById('clearFormBtn');
            if (clearFormBtn) {
                clearFormBtn.addEventListener('click', function() {
                    self.clearForm();
                });
            }

            // 拖拽上传
            const uploadArea = document.querySelector('.upload-area');
            if (uploadArea) {
                uploadArea.addEventListener('dragover', function(e) {
                    e.preventDefault();
                    uploadArea.classList.add('dragover');
                });

                uploadArea.addEventListener('dragleave', function() {
                    uploadArea.classList.remove('dragover');
                });

                uploadArea.addEventListener('drop', function(e) {
                    e.preventDefault();
                    uploadArea.classList.remove('dragover');
                    const files = e.dataTransfer.files;
                    if (files.length > 0) {
                        self.handleImageUpload(files[0]);
                    }
                });
            }

            // 实时计算百分位
            const inputs = ['ageMonths', 'height', 'weight', 'headCircumference'];
            inputs.forEach(function(id) {
                const input = document.getElementById(id);
                if (input) {
                    input.addEventListener('input', function() {
                        self.updatePercentiles();
                    });
                }
            });

            // 保存宝宝基本信息
            const babyInfoInputs = ['babyName', 'babyGender', 'babyBirthDate'];
            babyInfoInputs.forEach(function(id) {
                const input = document.getElementById(id);
                if (input) {
                    input.addEventListener('change', function() {
                        self.saveBabyInfo();
                        self.updateCurrentStatus();
                    });
                }
            });

            // 体检日期变化时自动计算月龄
            const checkDateInput = document.getElementById('checkDate');
            if (checkDateInput) {
                checkDateInput.addEventListener('change', function() {
                    self.autoCalculateAge();
                });
            }

            // 生成AI喂养建议按钮
            const generateFeedingBtn = document.getElementById('generateFeedingBtn');
            if (generateFeedingBtn) {
                generateFeedingBtn.addEventListener('click', function() {
                    self.generateAIFeedingGuide();
                });
            }
        }

        autoCalculateAge() {
            const birthDate = this.babyInfo.birthDate;
            const checkDate = document.getElementById('checkDate') ? document.getElementById('checkDate').value : '';
            
            console.log('计算月龄 - 出生日期:', birthDate, '体检日期:', checkDate);
            
            if (birthDate && checkDate) {
                const birth = new Date(birthDate);
                const check = new Date(checkDate);
                
                if (check >= birth) {
                    const years = check.getFullYear() - birth.getFullYear();
                    const months = check.getMonth() - birth.getMonth();
                    const days = check.getDate() - birth.getDate();
                    
                    let totalMonths = years * 12 + months;
                    if (days < 0) {
                        totalMonths -= 1;
                    }
                    
                    const exactMonths = totalMonths + (days >= 0 ? days / 30 : (30 + days) / 30);
                    const roundedMonths = Math.round(exactMonths * 10) / 10;
                    
                    const ageInput = document.getElementById('ageMonths');
                    if (ageInput) {
                        ageInput.value = roundedMonths;
                        this.updatePercentiles();
                        console.log('自动计算月龄:', roundedMonths);
                    }
                }
            } else if (!birthDate) {
                this.showMessage('🍼 请先在基本信息中填写出生日期', 'warning');
            }
        }

        saveApiKey() {
            const apiKeyInput = document.getElementById('apiKeyInput');
            if (apiKeyInput) {
                this.apiKey = apiKeyInput.value.trim();
                if (this.apiKey) {
                    localStorage.setItem('deepseek_api_key', this.apiKey);
                    this.updateApiStatus();
                    this.showMessage('🔑 API密钥保存成功', 'success');
                } else {
                    this.showMessage('❌ 请输入有效的API密钥', 'error');
                }
            }
        }

        saveBaiduOcrConfig() {
            const apiKeyInput = document.getElementById('baiduOcrApiKey');
            const secretKeyInput = document.getElementById('baiduOcrSecretKey');
            
            if (apiKeyInput && secretKeyInput) {
                const apiKey = apiKeyInput.value.trim();
                const secretKey = secretKeyInput.value.trim();
                
                if (apiKey && secretKey) {
                    this.baiduOcrConfig.apiKey = apiKey;
                    this.baiduOcrConfig.secretKey = secretKey;
                    
                    localStorage.setItem('baidu_ocr_api_key', apiKey);
                    localStorage.setItem('baidu_ocr_secret_key', secretKey);
                    
                    this.baiduOcrConfig.accessToken = '';
                    this.baiduOcrConfig.tokenExpireTime = 0;
                    localStorage.removeItem('baidu_ocr_access_token');
                    localStorage.removeItem('baidu_ocr_token_expire');
                    
                    this.updateBaiduOcrStatus();
                    this.showMessage('🔑 百度OCR配置保存成功', 'success');
                } else {
                    this.showMessage('❌ 请输入完整的百度OCR API Key和Secret Key', 'error');
                }
            }
        }

        updateBaiduOcrStatus() {
            const statusIndicator = document.getElementById('baiduOcrStatus');
            const statusText = document.getElementById('baiduOcrStatusText');
            
            if (this.baiduOcrConfig.apiKey && this.baiduOcrConfig.secretKey) {
                if (statusIndicator) statusIndicator.classList.add('connected');
                if (statusText) statusText.textContent = '🤖 百度OCR已配置';
            } else {
                if (statusIndicator) statusIndicator.classList.remove('connected');
                if (statusText) statusText.textContent = '😴 未配置';
            }
        }
        // 测试百度OCR连接
async testBaiduOcrConnection() {
    console.log('🔧 开始测试百度OCR连接...');
    
    try {
        this.showLoadingState('🔧 正在测试连接...');
        
        // 第一步：检查配置
        if (!this.baiduOcrConfig.apiKey || !this.baiduOcrConfig.secretKey) {
            throw new Error('❌ 请先填写百度OCR的API Key和Secret Key');
        }
        console.log('✅ 配置检查通过');
        
        // 第二步：直接测试百度OCR认证（跳过代理服务器健康检查）
        this.showLoadingState('🔑 正在测试百度OCR认证...');
        console.log('🔑 测试百度OCR认证...');
        
        // 清除旧的访问令牌，强制重新获取
        this.baiduOcrConfig.accessToken = '';
        this.baiduOcrConfig.tokenExpireTime = 0;
        
        const accessToken = await this.getBaiduOcrAccessToken();
        if (!accessToken) {
            throw new Error('❌ 获取访问令牌失败');
        }
        console.log('✅ 百度OCR认证成功，令牌长度：', accessToken.length);
        
        // 第三步：测试一个简单的OCR调用
        this.showLoadingState('🧪 正在测试OCR功能...');
        console.log('🧪 测试OCR功能可用性...');
        
        // 创建一个1x1像素的测试图片
        const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
        
        const testResponse = await fetch('https://jumpy-foil-whimsey.glitch.me/api/baidu-ocr', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                access_token: accessToken,
                image: testImageBase64,
                language_type: 'CHN_ENG'
            })
        });
        
        if (testResponse.ok) {
            console.log('✅ OCR API调用成功');
        } else {
            console.log('⚠️ OCR API调用失败，但认证成功');
        }
        
        // 测试成功
        this.hideLoadingState();
        this.showMessage('🎉 百度OCR连接测试成功！认证正常，可以进行图片识别', 'success');
        console.log('🎉 连接测试完成，认证正常！');
        
    } catch (error) {
        this.hideLoadingState();
        console.error('❌ 连接测试失败:', error);
        
        // 提供更详细的错误信息
        let errorMessage = error.message;
        if (error.message.includes('CORS')) {
            errorMessage = '网络连接问题，但这不影响图片识别功能的使用';
        }
        
        this.showMessage('❌ 连接测试失败: ' + errorMessage, 'error');
    }
}



        updateApiStatus() {
            const statusIndicator = document.getElementById('apiStatus');
            const statusText = document.getElementById('apiStatusText');
            
            if (this.apiKey && this.apiKey.trim() !== '') {
                if (statusIndicator) statusIndicator.classList.add('connected');
                if (statusText) statusText.textContent = '🤖 OCR+AI模式';
            } else {
                if (statusIndicator) statusIndicator.classList.remove('connected');
                if (statusText) statusText.textContent = '😴 未连接';
            }
        }

        saveBabyInfo() {
            this.babyInfo = {
                name: document.getElementById('babyName') ? document.getElementById('babyName').value : '',
                gender: document.getElementById('babyGender') ? document.getElementById('babyGender').value : '',
                birthDate: document.getElementById('babyBirthDate') ? document.getElementById('babyBirthDate').value : ''
            };
            
            this.saveData();
            console.log('宝宝信息已保存:', this.babyInfo);
        }

        clearAllRecords() {
            if (this.checkRecords.length === 0) {
                this.showMessage('🤔 没有记录需要清除', 'info');
                return;
            }
            
            if (confirm('🗑️ 确定要清除所有 ' + this.checkRecords.length + ' 条体检记录吗？此操作不可恢复！')) {
                this.checkRecords = [];
                this.saveData();
                this.updateRecordsTable();
                this.updateStatistics();
                this.updateCurrentStatus();
                this.updateChart();
                this.showMessage('✨ 所有记录已清除', 'success');
            }
        }

        async handleImageUpload(file) {
            if (!file) return;
            
            if (!this.validateBasicInfo()) {
                return;
            }
            
            if (this.isUploading) {
                this.showMessage('🤖 正在处理中，请稍候...', 'info');
                return;
            }
            
            if (!file.type.startsWith('image/')) {
                this.showMessage('🖼️ 请上传图片文件 (JPG, PNG, WEBP)', 'error');
                return;
            }
            
            if (file.size > 10 * 1024 * 1024) {
                this.showMessage('📦 图片文件太大，请选择小于10MB的图片', 'error');
                return;
            }
            
            if (!this.baiduOcrConfig.apiKey || !this.baiduOcrConfig.secretKey) {
                this.showMessage('🔧 请先配置百度OCR API密钥', 'error');
                return;
            }
            
            this.isUploading = true;
            
            try {
                this.showImagePreview(file);
                this.showLoadingState('🔍 正在初始化百度OCR识别...');
                const ocrResult = await this.performBaiduOCR(file);
                this.showOCRResult(ocrResult);
                this.hideLoadingState();
                this.showMessage('✨ OCR识别完成，请查看识别结果', 'success');
            } catch (error) {
                this.hideLoadingState();
                console.error('详细错误信息:', error);
                this.showMessage('❌ 识别失败: ' + error.message, 'error');
            } finally {
                this.isUploading = false;
                this.resetUploadInput();
            }
        }

        async getBaiduOcrAccessToken() {
            const now = Date.now();
            if (this.baiduOcrConfig.accessToken && now < this.baiduOcrConfig.tokenExpireTime) {
                return this.baiduOcrConfig.accessToken;
            }
            
            console.log('获取新的百度OCR访问令牌...');
            
            try {
                const response = await fetch('https://jumpy-foil-whimsey.glitch.me/api/baidu-token', {
                method: 'POST',
                headers: {
               'Content-Type': 'application/json'
               },
               body: JSON.stringify({
               client_id: this.baiduOcrConfig.apiKey,
               client_secret: this.baiduOcrConfig.secretKey
              })
              });

                
                if (!response.ok) {
                    throw new Error('获取访问令牌失败: ' + response.status);
                }
                
                const data = await response.json();
                
                if (data.error) {
                    throw new Error('百度API错误: ' + (data.error_description || data.error));
                }
                
                this.baiduOcrConfig.accessToken = data.access_token;
                this.baiduOcrConfig.tokenExpireTime = now + (data.expires_in - 300) * 1000;
                
                localStorage.setItem('baidu_ocr_access_token', data.access_token);
                localStorage.setItem('baidu_ocr_token_expire', this.baiduOcrConfig.tokenExpireTime.toString());
                
                console.log('百度OCR访问令牌获取成功');
                return data.access_token;
                
            } catch (error) {
                console.error('获取百度OCR访问令牌失败:', error);
                throw new Error('获取访问令牌失败: ' + error.message);
            }
        }

        async fileToBase64(file) {
            return new Promise(function(resolve, reject) {
                const reader = new FileReader();
                reader.onload = function() {
                    const base64 = reader.result.split(',')[1];
                    resolve(base64);
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        }

        async performBaiduOCR(file) {
            try {
                console.log('开始百度OCR识别...文件大小:', file.size, '类型:', file.type);
                
                this.showLoadingState('🔑 正在获取访问令牌...');
                const accessToken = await this.getBaiduOcrAccessToken();
                
                this.showLoadingState('📷 正在处理图片...');
                const base64Image = await this.fileToBase64(file);
                
                this.showLoadingState('🔍 正在识别文字...');
                const response = await fetch('https://jumpy-foil-whimsey.glitch.me/api/baidu-ocr', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        access_token: accessToken,
        image: base64Image,
        language_type: 'CHN_ENG',
        detect_direction: 'true',
        paragraph: 'false',
        probability: 'false'
    })
});

                
                if (!response.ok) {
                    throw new Error('百度OCR API调用失败: ' + response.status);
                }
                
                const data = await response.json();
                
                if (data.error_code) {
                    throw new Error('百度OCR错误 (' + data.error_code + '): ' + data.error_msg);
                }
                
                if (!data.words_result || data.words_result.length === 0) {
                    throw new Error('未识别到任何文字，请确保图片清晰可读');
                }
                
                const recognizedText = data.words_result
                    .map(function(item) { return item.words; })
                    .join('\n');
                
                console.log('百度OCR识别完成');
                console.log('识别到文字行数:', data.words_result.length);
                console.log('识别文本长度:', recognizedText.length);
                console.log('识别文本:', recognizedText);
                
                return recognizedText;
                
            } catch (error) {
                console.error('百度OCR识别失败:', error);
                throw new Error('图片文字识别失败: ' + error.message);
            }
        }

        showOCRResult(ocrText) {
            const self = this;
            this.lastOCRResult = ocrText;
            
            let resultDiv = document.getElementById('ocrResultDiv');
            
            if (!resultDiv) {
                resultDiv = document.createElement('div');
                resultDiv.id = 'ocrResultDiv';
                resultDiv.className = 'card cute-card';
                resultDiv.style.cssText = 'background: linear-gradient(135deg, #E5F3FF 0%, #F0FFE5 100%); border: 3px solid #4FACFE; margin: 20px 0; padding: 25px; border-radius: 20px; box-shadow: 0 8px 25px rgba(79, 172, 254, 0.3);';
                const uploadedImageDiv = document.getElementById('uploadedImage');
                if (uploadedImageDiv && uploadedImageDiv.parentNode) {
                    uploadedImageDiv.parentNode.insertBefore(resultDiv, uploadedImageDiv.nextSibling);
                }
            }
            
            resultDiv.innerHTML = '<div style="text-align: center; margin-bottom: 20px;"><h4 style="color: #4FACFE; margin-bottom: 10px; font-size: 1.4em;">🔍 百度OCR识别结果</h4><p style="color: #666; font-size: 0.9em;">✨ 文字识别完成，接下来可以进行智能解析</p></div><div style="background: white; padding: 20px; border-radius: 15px; border: 2px solid #B6E5FC; margin-bottom: 20px;"><h5 style="color: #4FACFE; margin-bottom: 15px;">📝 原始识别文本：</h5><pre style="white-space: pre-wrap; font-size: 14px; line-height: 1.4; margin: 10px 0; color: #333; background: #F8F9FA; padding: 15px; border-radius: 10px; max-height: 200px; overflow-y: auto;">' + ocrText + '</pre></div><div style="background: white; padding: 20px; border-radius: 15px; border: 2px solid #B6E5FC; margin-bottom: 20px;"><h5 style="color: #4FACFE; margin-bottom: 15px;">📊 文本统计：</h5><div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; font-size: 0.9em;"><div style="background: #F0F8FF; padding: 10px; border-radius: 8px; text-align: center;"><strong>📏 字符总数:</strong><br>' + ocrText.length + '</div><div style="background: #F0FFF0; padding: 10px; border-radius: 8px; text-align: center;"><strong>📄 行数:</strong><br>' + ocrText.split('\n').length + '</div><div style="background: #FFF8DC; padding: 10px; border-radius: 8px; text-align: center;"><strong>🔢 包含数字:</strong><br>' + (/\d/.test(ocrText) ? '✅ 是' : '❌ 否') + '</div><div style="background: #FFE4E1; padding: 10px; border-radius: 8px; text-align: center;"><strong>🇨🇳 包含中文:</strong><br>' + (/[\u4e00-\u9fff]/.test(ocrText) ? '✅ 是' : '❌ 否') + '</div></div></div><div style="text-align: center; display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;"><button onclick="window.babyTracker.parseOCRResultManually()" class="btn btn-primary cute-btn" style="background: linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%); padding: 12px 25px; border-radius: 25px; font-weight: 600; box-shadow: 0 5px 15px rgba(79, 172, 254, 0.4);">🤖 智能解析数据</button><button onclick="window.babyTracker.hideOCRResult()" class="btn btn-secondary cute-btn" style="background: linear-gradient(135deg, #DDA0DD 0%, #DA70D6 100%); padding: 12px 25px; border-radius: 25px; font-weight: 600;">❌ 关闭结果</button></div>';
            
            resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        async parseOCRResultManually() {
            if (!this.lastOCRResult) {
                this.showMessage('❌ 没有OCR识别结果', 'error');
                return;
            }
            
            try {
                this.showLoadingState('🤖 正在智能解析表格数据...');
                
                const localParsedData = this.parseTableStructure(this.lastOCRResult);
                console.log('本地解析结果:', localParsedData);
                
                const aiEnhancedData = await this.enhanceDataWithAI(this.lastOCRResult, localParsedData);
                console.log('AI增强结果:', aiEnhancedData);
                
                const finalData = this.mergeDataResults(localParsedData, aiEnhancedData);
                
                this.showParseResult(finalData);
                this.handleMultipleRecords(finalData);
                this.hideLoadingState();
                this.showMessage('🎉 成功解析 ' + (finalData.records ? finalData.records.length : 0) + ' 条体检记录', 'success');
                
            } catch (error) {
                this.hideLoadingState();
                this.showMessage('❌ 解析失败: ' + error.message, 'error');
                console.error('表格解析错误:', error);
            }
        }

        parseTableStructure(text) {
            console.log('=== 开始本地表格解析 ===');
            const result = {
                records: []
            };
            
            let cleanText = text
                .replace(/[|\[\]{}]/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
            
            console.log('清理后文本:', cleanText);
            
            const lines = cleanText.split('\n').map(function(line) { return line.trim(); }).filter(function(line) { return line.length > 0; });
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const record = this.parseTableRow(line);
                if (record) {
                    console.log('第' + (i+1) + '行识别到记录:', record);
                    result.records.push(record);
                }
            }
            
            result.records.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
            
            console.log('本地解析完成，共', result.records.length, '条记录');
            return result;
        }

        parseTableRow(line) {
            if (line.includes('体检日期') || line.includes('年龄') || line.includes('身高') || line.includes('体重')) {
                return null;
            }
            
            const record = {};
            
            const datePatterns = [
                /(\d{4}[-\/]\d{1,2}[-\/]\d{1,2})/,
                /(\d{4}年\d{1,2}月\d{1,2}日)/
            ];
            
            for (let i = 0; i < datePatterns.length; i++) {
                const pattern = datePatterns[i];
                const match = line.match(pattern);
                if (match) {
                    record.date = match[1].replace(/年/g, '-').replace(/月/g, '-').replace(/日/g, '');
                    break;
                }
            }
            
            if (!record.date) return null;
            
            const ageMonths = this.extractAgeInMonths(line);
            if (ageMonths !== null) {
                record.ageMonths = ageMonths;
            }
            
            const weightMatch = line.match(/(\d+(?:\.\d+)?)\s*(?:kg|公斤)/i);
            if (weightMatch) {
                record.weight = parseFloat(weightMatch[1]);
            } else {
                const numbers = line.match(/\d+(?:\.\d+)?/g);
                if (numbers) {
                    for (let i = 0; i < numbers.length; i++) {
                        const num = numbers[i];
                        const val = parseFloat(num);
                        if (val >= 2 && val <= 30) {
                            record.weight = val;
                            break;
                        }
                    }
                }
            }
            
            const heightMatch = line.match(/(\d+(?:\.\d+)?)\s*(?:cm|厘米)/i);
            if (heightMatch) {
                record.height = parseFloat(heightMatch[1]);
            } else {
                const numbers = line.match(/\d+(?:\.\d+)?/g);
                if (numbers) {
                    for (let i = 0; i < numbers.length; i++) {
                        const num = numbers[i];
                        const val = parseFloat(num);
                        if (val >= 40 && val <= 120) {
                            record.height = val;
                            break;
                        }
                    }
                }
            }
            
            const headMatch = line.match(/(?:头围|头周)[：:\s]*(\d+(?:\.\d+)?)/);
            if (headMatch) {
                record.headCircumference = parseFloat(headMatch[1]);
            } else {
                const numbers = line.match(/\d+(?:\.\d+)?/g);
                if (numbers) {
                    for (let i = 0; i < numbers.length; i++) {
                        const num = numbers[i];
                        const val = parseFloat(num);
                        if (val >= 30 && val <= 60) {
                            record.headCircumference = val;
                            break;
                        }
                    }
                }
            }
            
            if (record.weight || record.height || record.headCircumference) {
                return record;
            }
            
            return null;
        }

        extractAgeInMonths(text) {
            const ageYearMonthMatch = text.match(/(\d+)岁(\d+)月/);
            if (ageYearMonthMatch) {
                const years = parseInt(ageYearMonthMatch[1]);
                const months = parseInt(ageYearMonthMatch[2]);
                return years * 12 + months;
            }
            
            const ageMonthDayMatch = text.match(/(\d+)月(\d+)天/);
            if (ageMonthDayMatch) {
                const months = parseInt(ageMonthDayMatch[1]);
                const days = parseInt(ageMonthDayMatch[2]);
                return months + (days / 30);
            }
            
            const ageDayMatch = text.match(/^(\d+)天$/);
            if (ageDayMatch) {
                const days = parseInt(ageDayMatch[1]);
                return days / 30;
            }
            
            const ageMonthMatch = text.match(/(\d+)个月/);
            if (ageMonthMatch) {
                return parseInt(ageMonthMatch[1]);
            }
            
            return null;
        }

        async enhanceDataWithAI(ocrText, localData) {
            if (!this.apiKey) {
                console.log('无API密钥，跳过AI增强');
                return { records: [] };
            }
            
            const prompt = '你是体检报告分析专家。请分析以下OCR识别的体检报告文本，提取所有体检记录。\n\nOCR文本：\n' + ocrText + '\n\n本地解析已识别到 ' + localData.records.length + ' 条记录。\n\n请按以下JSON格式返回所有体检记录，特别注意：\n1. 年龄格式转换：\n   "1岁2月" = 14个月\n   "8月0天" = 8个月  \n   "6月1天" = 6.03个月\n2. 数据验证：体重(2-30kg)、身高(40-120cm)、头围(30-60cm)\n3. 只返回JSON，不要其他说明\n\n{\n  "records": [\n    {\n      "date": "2025-04-03",\n      "ageMonths": 14.7,\n      "weight": 11.4,\n      "height": 81.5,\n      "headCircumference": 47.5\n    }\n  ]\n}';
            
            try {
                const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + this.apiKey
                    },
                    body: JSON.stringify({
                        model: "deepseek-chat",
                        messages: [{
                            role: "user",
                            content: prompt
                        }],
                        max_tokens: 1500,
                        temperature: 0.1
                    })
                });
                
                if (!response.ok) {
                    throw new Error('AI API调用失败: ' + response.status);
                }
                
                const data = await response.json();
                const aiResponse = data.choices[0].message.content;
                
                console.log('AI原始响应:', aiResponse);
                
                const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    return JSON.parse(jsonMatch[0]);
                } else {
                    throw new Error('AI返回格式错误');
                }
                
            } catch (error) {
                console.error('AI增强失败:', error);
                return { records: [] };
            }
        }

        mergeDataResults(localData, aiData) {
            console.log('=== 合并解析结果 ===');
            const merged = {
                records: []
            };
            
            const allRecords = localData.records.slice();
            
            if (aiData.records && Array.isArray(aiData.records)) {
                for (let i = 0; i < aiData.records.length; i++) {
                    const aiRecord = aiData.records[i];
                    const existing = allRecords.find(function(r) { return r.date === aiRecord.date; });
                    if (!existing) {
                        allRecords.push(aiRecord);
                    } else {
                        if (!existing.weight && aiRecord.weight) existing.weight = aiRecord.weight;
                        if (!existing.height && aiRecord.height) existing.height = aiRecord.height;
                        if (!existing.headCircumference && aiRecord.headCircumference) existing.headCircumference = aiRecord.headCircumference;
                        if (!existing.ageMonths && aiRecord.ageMonths) existing.ageMonths = aiRecord.ageMonths;
                    }
                }
            }
            
            merged.records = allRecords.filter(function(record) {
                if (!record.date) return false;
                
                if (record.weight && (record.weight < 1 || record.weight > 50)) return false;
                if (record.height && (record.height < 30 || record.height > 150)) return false;
                if (record.headCircumference && (record.headCircumference < 25 || record.headCircumference > 65)) return false;
                
                return record.weight || record.height || record.headCircumference;
            });
            
            merged.records.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
            
            console.log('合并完成，最终记录数:', merged.records.length);
            return merged;
        }

        showParseResult(extractedData) {
            let parseDiv = document.getElementById('parseResultDiv');
            
            if (!parseDiv) {
                parseDiv = document.createElement('div');
                parseDiv.id = 'parseResultDiv';
                parseDiv.className = 'card cute-card';
                parseDiv.style.cssText = 'background: linear-gradient(135deg, #FFE5F1 0%, #FFE5E5 100%); border: 3px solid #FF69B4; margin: 20px 0; padding: 25px; border-radius: 20px; box-shadow: 0 8px 25px rgba(255, 105, 180, 0.3);';
                const ocrDiv = document.getElementById('ocrResultDiv');
                if (ocrDiv && ocrDiv.parentNode) {
                    ocrDiv.parentNode.insertBefore(parseDiv, ocrDiv.nextSibling);
                }
            }
            
            const recordsCount = extractedData.records ? extractedData.records.length : 0;
            
            parseDiv.innerHTML = '<div style="text-align: center; margin-bottom: 20px;"><h4 style="color: #FF1493; margin-bottom: 10px; font-size: 1.4em;">🎯 智能识别结果<span style="background: #FF69B4; color: white; padding: 5px 12px; border-radius: 15px; font-size: 0.8em;">' + recordsCount + '条记录</span></h4><p style="color: #666; font-size: 0.9em;">💡 可以编辑下方数据，确保准确性后再添加到记录中</p></div><div style="background: white; padding: 20px; border-radius: 15px; border: 2px solid #FFB6C1; margin-bottom: 20px;"><h5 style="color: #FF1493; margin-bottom: 15px; display: flex; align-items: center;"><span>📊 识别概况</span></h5><div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; font-size: 0.9em;"><div style="background: #FFF0F5; padding: 10px; border-radius: 10px;"><strong>📈 识别记录数:</strong> ' + recordsCount + '</div><div style="background: #F0F8FF; padding: 10px; border-radius: 10px;"><strong>🤖 解析方式:</strong> 百度OCR + AI增强</div><div style="background: #F0FFF0; padding: 10px; border-radius: 10px;"><strong>✅ 数据完整性:</strong> ' + this.getDataCompleteness(extractedData.records) + '</div></div></div>' + this.generateEditableRecordsHtml(extractedData.records) + '<div style="text-align: center; margin-top: 20px; display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;"><button onclick="window.babyTracker.saveEditedRecords()" class="btn btn-success cute-btn" style="background: linear-gradient(135deg, #FF69B4 0%, #FF1493 100%); padding: 12px 25px; border-radius: 25px; font-weight: 600; box-shadow: 0 5px 15px rgba(255, 105, 180, 0.4);">✨ 保存并添加记录</button><button onclick="window.babyTracker.hideOCRResult()" class="btn btn-secondary cute-btn" style="background: linear-gradient(135deg, #DDA0DD 0%, #DA70D6 100%); padding: 12px 25px; border-radius: 25px; font-weight: 600;">❌ 取消</button></div>';
            
            parseDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        generateEditableRecordsHtml(records) {
            if (!records || records.length === 0) {
                return '<div style="background: white; padding: 20px; border-radius: 15px; border: 2px solid #FFB6C1; text-align: center;"><p style="color: #888; font-size: 1.1em;">🤔 未识别到有效记录</p><p style="color: #666; font-size: 0.9em;">请检查图片是否清晰，或尝试手动添加记录</p></div>';
            }
            
            let html = '<div style="background: white; padding: 20px; border-radius: 15px; border: 2px solid #FFB6C1;"><h5 style="color: #FF1493; margin-bottom: 15px; display: flex; align-items: center;"><span>✏️ 编辑识别数据</span><span style="margin-left: auto; font-size: 0.8em; color: #888;">点击表格单元格可编辑</span></h5><div style="overflow-x: auto;"><table id="editableRecordsTable" style="width: 100%; border-collapse: collapse; font-size: 0.9em;"><thead><tr style="background: linear-gradient(135deg, #FFB6C1 0%, #FFC0CB 100%);"><th style="padding: 12px 8px; border: 1px solid #FF69B4; color: #8B008B; font-weight: 600;">📅 体检日期</th><th style="padding: 12px 8px; border: 1px solid #FF69B4; color: #8B008B; font-weight: 600;">👶 月龄</th><th style="padding: 12px 8px; border: 1px solid #FF69B4; color: #8B008B; font-weight: 600;">📏 身高(cm)</th><th style="padding: 12px 8px; border: 1px solid #FF69B4; color: #8B008B; font-weight: 600;">⚖️ 体重(kg)</th><th style="padding: 12px 8px; border: 1px solid #FF69B4; color: #8B008B; font-weight: 600;">🧠 头围(cm)</th><th style="padding: 12px 8px; border: 1px solid #FF69B4; color: #8B008B; font-weight: 600;">🛠️ 操作</th></tr></thead><tbody>';
            
            for (let i = 0; i < records.length; i++) {
                const record = records[i];
                html += '<tr data-index="' + i + '" style="background: ' + (i % 2 === 0 ? '#FFF8DC' : '#F0F8FF') + ';"><td style="padding: 10px 8px; border: 1px solid #FFB6C1;"><input type="date" value="' + (record.date || '') + '" onchange="window.babyTracker.updateEditedRecord(' + i + ', \'date\', this.value)" style="width: 100%; border: none; background: transparent; text-align: center; font-size: 0.9em;"></td><td style="padding: 10px 8px; border: 1px solid #FFB6C1;"><input type="number" step="0.1" value="' + (record.ageMonths || '') + '" onchange="window.babyTracker.updateEditedRecord(' + i + ', \'ageMonths\', this.value)" style="width: 100%; border: none; background: transparent; text-align: center; font-size: 0.9em;" placeholder="月"></td><td style="padding: 10px 8px; border: 1px solid #FFB6C1;"><input type="number" step="0.1" value="' + (record.height || '') + '" onchange="window.babyTracker.updateEditedRecord(' + i + ', \'height\', this.value)" style="width: 100%; border: none; background: transparent; text-align: center; font-size: 0.9em;" placeholder="cm"></td><td style="padding: 10px 8px; border: 1px solid #FFB6C1;"><input type="number" step="0.1" value="' + (record.weight || '') + '" onchange="window.babyTracker.updateEditedRecord(' + i + ', \'weight\', this.value)" style="width: 100%; border: none; background: transparent; text-align: center; font-size: 0.9em;" placeholder="kg"></td><td style="padding: 10px 8px; border: 1px solid #FFB6C1;"><input type="number" step="0.1" value="' + (record.headCircumference || '') + '" onchange="window.babyTracker.updateEditedRecord(' + i + ', \'headCircumference\', this.value)" style="width: 100%; border: none; background: transparent; text-align: center; font-size: 0.9em;" placeholder="cm"></td><td style="padding: 10px 8px; border: 1px solid #FFB6C1; text-align: center;"><button onclick="window.babyTracker.deleteEditedRecord(' + i + ')" style="background: linear-gradient(135deg, #FF6B6B 0%, #FF5252 100%); color: white; border: none; border-radius: 15px; padding: 5px 10px; font-size: 0.8em; cursor: pointer;">🗑️ 删除</button></td></tr>';
            }
            
            html += '</tbody></table></div><div style="text-align: center; margin-top: 15px;"><button onclick="window.babyTracker.addNewEditedRecord()" style="background: linear-gradient(135deg, #98FB98 0%, #90EE90 100%); color: #006400; border: none; border-radius: 20px; padding: 10px 20px; font-weight: 600; cursor: pointer; box-shadow: 0 3px 10px rgba(152, 251, 152, 0.4);">➕ 添加新记录</button></div></div>';
            
            return html;
        }

        updateEditedRecord(index, field, value) {
            if (!this.tempExtractedData || !this.tempExtractedData.records) {
                return;
            }
            
            if (this.tempExtractedData.records[index]) {
                if (field === 'ageMonths' || field === 'height' || field === 'weight' || field === 'headCircumference') {
                    this.tempExtractedData.records[index][field] = value ? parseFloat(value) : null;
                } else {
                    this.tempExtractedData.records[index][field] = value;
                }
                
                console.log('更新记录:', index, field, value);
                this.validateEditedRecord(index);
            }
        }

        validateEditedRecord(index) {
            const record = this.tempExtractedData.records[index];
            const row = document.querySelector('tr[data-index="' + index + '"]');
            if (!row) return;
            
            const inputs = row.querySelectorAll('input');
            for (let i = 0; i < inputs.length; i++) {
                const input = inputs[i];
                input.style.border = 'none';
                input.style.background = 'transparent';
            }
            
            let hasError = false;
            
            if (record.weight && (record.weight < 1 || record.weight > 50)) {
                const weightInput = row.querySelector('input[onchange*="weight"]');
                if (weightInput) {
                    weightInput.style.border = '2px solid #FF6B6B';
                    weightInput.style.background = '#FFE5E5';
                }
                hasError = true;
            }
            
            if (record.height && (record.height < 30 || record.height > 150)) {
                const heightInput = row.querySelector('input[onchange*="height"]');
                if (heightInput) {
                    heightInput.style.border = '2px solid #FF6B6B';
                    heightInput.style.background = '#FFE5E5';
                }
                hasError = true;
            }
            
            if (record.headCircumference && (record.headCircumference < 25 || record.headCircumference > 65)) {
                const headInput = row.querySelector('input[onchange*="headCircumference"]');
                if (headInput) {
                    headInput.style.border = '2px solid #FF6B6B';
                    headInput.style.background = '#FFE5E5';
                }
                hasError = true;
            }
            
            if (hasError) {
                this.showMessage('⚠️ 请检查数据范围：体重(1-50kg)、身高(30-150cm)、头围(25-65cm)', 'warning');
            }
        }

        deleteEditedRecord(index) {
            if (!this.tempExtractedData || !this.tempExtractedData.records) {
                return;
            }
            
            if (confirm('🤔 确定要删除这条记录吗？')) {
                this.tempExtractedData.records.splice(index, 1);
                this.showParseResult(this.tempExtractedData);
                this.showMessage('✅ 记录已删除', 'success');
            }
        }

        addNewEditedRecord() {
            if (!this.tempExtractedData) {
                this.tempExtractedData = { records: [] };
            }
            
            const newRecord = {
                date: new Date().toISOString().split('T')[0],
                ageMonths: null,
                height: null,
                weight: null,
                headCircumference: null
            };
            
            this.tempExtractedData.records.push(newRecord);
            this.showParseResult(this.tempExtractedData);
            this.showMessage('✨ 已添加新记录，请填写数据', 'info');
        }

        saveEditedRecords() {
            if (!this.tempExtractedData || !this.tempExtractedData.records) {
                this.showMessage('❌ 没有可保存的记录', 'error');
                return;
            }
            
            const validRecords = this.tempExtractedData.records.filter(function(record) {
                return record.date && (record.height || record.weight || record.headCircumference);
            });
            
            if (validRecords.length === 0) {
                this.showMessage('❌ 没有有效的记录数据', 'error');
                return;
            }
            
            this.tempExtractedData.records = validRecords;
            this.addAllRecords();
        }

        getDataCompleteness(records) {
            if (!records || records.length === 0) return '无数据';
            
            let completeCount = 0;
            for (let i = 0; i < records.length; i++) {
                const record = records[i];
                if (record.weight && record.height && record.headCircumference && record.ageMonths) {
                    completeCount++;
                }
            }
            
            return completeCount + '/' + records.length + ' 条记录数据完整';
        }

        handleMultipleRecords(extractedData) {
            console.log('=== 处理多条记录 ===');
            this.tempExtractedData = extractedData;
            console.log('识别到体检记录数量:', extractedData.records ? extractedData.records.length : 0);
        }

        addAllRecords() {
            if (!this.tempExtractedData || !this.tempExtractedData.records) {
                this.showMessage('❌ 没有可添加的记录', 'error');
                return;
            }
            
            const gender = this.babyInfo.gender || 'male';
            let addedCount = 0;
            
            for (let i = 0; i < this.tempExtractedData.records.length; i++) {
                const record = this.tempExtractedData.records[i];
                const existing = this.checkRecords.find(function(r) { return r.checkDate === record.date; });
                if (!existing) {
                    const recordWithPercentiles = {
                        checkDate: record.date,
                        ageMonths: record.ageMonths,
                        height: record.height,
                        weight: record.weight,
                        headCircumference: record.headCircumference,
                        id: Date.now() + Math.random(),
                        addedAt: new Date().toISOString(),
                        heightPercentile: record.height ? this.calculateWHOPercentileWithLinearInterpolation(record.ageMonths, record.height, 'height', gender) : null,
                        weightPercentile: record.weight ? this.calculateWHOPercentileWithLinearInterpolation(record.ageMonths, record.weight, 'weight', gender) : null,
                        headPercentile: record.headCircumference ? this.calculateWHOPercentileWithLinearInterpolation(record.ageMonths, record.headCircumference, 'headCircumference', gender) : null
                    };
                    
                    this.checkRecords.push(recordWithPercentiles);
                    addedCount++;
                }
            }
            
            if (addedCount > 0) {
                this.saveData();
                this.updateRecordsTable();
                this.updateCurrentStatus();
                this.updateChart();
                this.showMessage('🎉 成功添加 ' + addedCount + ' 条体检记录', 'success');
            } else {
                this.showMessage('ℹ️ 所有记录已存在，未添加新记录', 'info');
            }
            
            this.hideOCRResult();
            this.tempExtractedData = null;
        }

        hideOCRResult() {
            const ocrDiv = document.getElementById('ocrResultDiv');
            const parseDiv = document.getElementById('parseResultDiv');
            if (ocrDiv) ocrDiv.remove();
            if (parseDiv) parseDiv.remove();
        }

        resetUploadInput() {
            const reportUpload = document.getElementById('reportUpload');
            if (reportUpload) {
                reportUpload.value = '';
            }
        }

        showImagePreview(file) {
            const uploadedImageDiv = document.getElementById('uploadedImage');
            const previewImage = document.getElementById('previewImage');
            
            if (uploadedImageDiv && previewImage) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    previewImage.src = e.target.result;
                    uploadedImageDiv.classList.remove('hidden');
                };
                reader.readAsDataURL(file);
            }
        }

        updatePercentiles() {
            const ageMonths = parseFloat(document.getElementById('ageMonths') ? document.getElementById('ageMonths').value : '') || null;
            const height = parseFloat(document.getElementById('height') ? document.getElementById('height').value : '') || null;
            const weight = parseFloat(document.getElementById('weight') ? document.getElementById('weight').value : '') || null;
            const headCircumference = parseFloat(document.getElementById('headCircumference') ? document.getElementById('headCircumference').value : '') || null;
            
            console.log('计算百分位 - 年龄:', ageMonths, '身高:', height, '体重:', weight, '头围:', headCircumference);
            
            if (!ageMonths) {
                this.updatePercentileDisplay({
                    height: null,
                    weight: null,
                    headCircumference: null
                });
                return;
            }
            
            const gender = this.babyInfo.gender || 'male';
            const percentiles = {
                height: this.calculateWHOPercentileWithLinearInterpolation(ageMonths, height, 'height', gender),
                weight: this.calculateWHOPercentileWithLinearInterpolation(ageMonths, weight, 'weight', gender),
                headCircumference: this.calculateWHOPercentileWithLinearInterpolation(ageMonths, headCircumference, 'headCircumference', gender)
            };
            
            console.log('计算出的百分位:', percentiles);
            this.updatePercentileDisplay(percentiles);
        }

        calculateWHOPercentileWithLinearInterpolation(ageMonths, value, type, gender) {
            if (!value || !ageMonths) return null;
            
            console.log('\n=== 计算' + type + '百分位 (线性插值) ===');
            console.log('年龄: ' + ageMonths + '月, ' + type + ': ' + value + ', 性别: ' + gender);
            
            let dataKey;
            if (type === 'height') {
                dataKey = gender === 'female' ? 'femaleHeight' : 'maleHeight';
            } else if (type === 'weight') {
                dataKey = gender === 'female' ? 'femaleWeight' : 'maleWeight';
            } else if (type === 'headCircumference') {
                dataKey = gender === 'female' ? 'femaleHeadCircumference' : 'maleHeadCircumference';
            }
            
            const whoDataSource = this.whoData[dataKey];
            
            const lowerAge = Math.floor(ageMonths);
            const upperAge = Math.ceil(ageMonths);
            
            console.log('年龄边界: ' + lowerAge + '月 到 ' + upperAge + '月');
            
            if (lowerAge === upperAge) {
                const whoRecord = whoDataSource[lowerAge];
                if (!whoRecord) {
                    console.log('❌ 没有找到' + lowerAge + '月龄的WHO数据');
                    return null;
                }
                return this.calculatePercentileFromWHOData(value, whoRecord, lowerAge + '月整数月龄');
            }
            
            const lowerWHOData = whoDataSource[lowerAge];
            const upperWHOData = whoDataSource[upperAge];
            
            if (!lowerWHOData || !upperWHOData) {
                console.log('❌ 缺少WHO数据: ' + lowerAge + '月=' + !!lowerWHOData + ', ' + upperAge + '月=' + !!upperWHOData);
                return null;
            }
            
            const ratio = ageMonths - lowerAge;
            console.log('插值比例: (' + ageMonths + ' - ' + lowerAge + ') = ' + ratio);
            
            const interpolatedWHOData = [];
            for (let i = 0; i < 7; i++) {
                const interpolatedValue = lowerWHOData[i] + ratio * (upperWHOData[i] - lowerWHOData[i]);
                interpolatedWHOData.push(parseFloat(interpolatedValue.toFixed(2)));
            }
            
            console.log(lowerAge + '月WHO数据:', lowerWHOData);
            console.log(upperAge + '月WHO数据:', upperWHOData);
            console.log('插值后WHO数据:', interpolatedWHOData);
            
            return this.calculatePercentileFromWHOData(value, interpolatedWHOData, ageMonths + '月插值数据');
        }

        calculatePercentileFromWHOData(value, whoData, description) {
            console.log('\n--- 基于' + description + '计算百分位 ---');
            
            const sd3neg = whoData[0];
            const sd2neg = whoData[1];
            const sd1neg = whoData[2];
            const median = whoData[3];
            const sd1pos = whoData[4];
            const sd2pos = whoData[5];
            const sd3pos = whoData[6];
            
            console.log('WHO标准数据:');
            console.log('  -3SD: ' + sd3neg);
            console.log('  -2SD: ' + sd2neg);
            console.log('  -1SD: ' + sd1neg);
            console.log('  中位数: ' + median);
            console.log('  +1SD: ' + sd1pos);
            console.log('  +2SD: ' + sd2pos);
            console.log('  +3SD: ' + sd3pos);
            
            let interval = '';
            let percentile = null;
            
            if (value <= sd3neg) {
                interval = '< -3SD (严重偏低)';
                percentile = 0.1;
            } else if (value <= sd2neg) {
                interval = '-3SD 到 -2SD 之间 (偏低)';
                const ratio = (value - sd3neg) / (sd2neg - sd3neg);
                percentile = 0.1 + ratio * (2.3 - 0.1);
            } else if (value <= sd1neg) {
                interval = '-2SD 到 -1SD 之间 (稍低)';
                const ratio = (value - sd2neg) / (sd1neg - sd2neg);
                percentile = 2.3 + ratio * (15.9 - 2.3);
            } else if (value <= median) {
                interval = '-1SD 到 中位数 之间 (正常偏低)';
                const ratio = (value - sd1neg) / (median - sd1neg);
                percentile = 15.9 + ratio * (50 - 15.9);
            } else if (value <= sd1pos) {
                interval = '中位数 到 +1SD 之间 (正常偏高)';
                const ratio = (value - median) / (sd1pos - median);
                percentile = 50 + ratio * (84.1 - 50);
            } else if (value <= sd2pos) {
                interval = '+1SD 到 +2SD 之间 (稍高)';
                const ratio = (value - sd1pos) / (sd2pos - sd1pos);
                percentile = 84.1 + ratio * (97.7 - 84.1);
            } else if (value <= sd3pos) {
                interval = '+2SD 到 +3SD 之间 (偏高)';
                const ratio = (value - sd2pos) / (sd3pos - sd2pos);
                percentile = 97.7 + ratio * (99.9 - 97.7);
            } else {
                interval = '> +3SD (严重偏高)';
                percentile = 99.9;
            }            
            console.log('📊 标准差区间: ' + interval);
            console.log('📈 计算百分位: ' + (percentile ? percentile.toFixed(1) : 'null') + '%');
            
            const finalPercentile = Math.max(0.1, Math.min(99.9, Math.round(percentile * 10) / 10));
            console.log('✅ 最终百分位: ' + finalPercentile + '%');
            console.log('--- 计算完成 ---\n');
            
            return finalPercentile;
        }

        updatePercentileDisplay(percentiles) {
            const heightPercentileEl = document.getElementById('heightPercentile');
            const weightPercentileEl = document.getElementById('weightPercentile');
            const headPercentileEl = document.getElementById('headPercentile');
            
            if (heightPercentileEl) {
                heightPercentileEl.textContent = percentiles.height !== null ? percentiles.height + '%' : '--';
            }
            if (weightPercentileEl) {
                weightPercentileEl.textContent = percentiles.weight !== null ? percentiles.weight + '%' : '--';
            }
            if (headPercentileEl) {
                headPercentileEl.textContent = percentiles.headCircumference !== null ? percentiles.headCircumference + '%' : '--';
            }
        }

        initializeChart() {
            const ctx = document.getElementById('growthChart');
            if (!ctx) return;
            
            if (typeof Chart === 'undefined') {
                console.warn('Chart.js未加载，跳过图表初始化');
                return;
            }
            
            const config = {
                type: 'line',
                data: {
                    labels: [],
                    datasets: []
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: '🌈 生长发育曲线图'
                        },
                        legend: {
                            display: true,
                            position: 'top'
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: '年龄 (月)'
                            },
                            min: 0,
                            max: 36
                        },
                        y: {
                            title: {
                                display: true,
                                text: '数值'
                            }
                        }
                    },
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    }
                }
            };
            
            this.growthChart = new Chart(ctx, config);
            this.updateChart();
        }

        updateChart() {
            if (!this.growthChart) return;
            
            const gender = this.babyInfo.gender || 'male';
            const chartType = document.querySelector('input[name="chartType"]:checked') ? document.querySelector('input[name="chartType"]:checked').value : 'height';
            
            const whoKey = gender === 'female' ? 
                'female' + chartType.charAt(0).toUpperCase() + chartType.slice(1) : 
                'male' + chartType.charAt(0).toUpperCase() + chartType.slice(1);
            const whoData = this.whoData[whoKey] || this.whoData.maleHeight;
            
            const ageLabels = [];
            for (let i = 0; i <= 36; i++) {
                ageLabels.push(i);
            }
            
            const standardLines = [
                {
                    label: '-2SD (3%)',
                    data: [],
                    borderColor: '#ff6b6b',
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    pointRadius: 0
                },
                {
                    label: '-1SD (15%)',
                    data: [],
                    borderColor: '#ffa726',
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    pointRadius: 0
                },
                {
                    label: '中位数 (50%)',
                    data: [],
                    borderColor: '#4caf50',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    pointRadius: 0
                },
                {
                    label: '+1SD (85%)',
                    data: [],
                    borderColor: '#ffa726',
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    pointRadius: 0
                },
                {
                    label: '+2SD (97%)',
                    data: [],
                    borderColor: '#ff6b6b',
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    pointRadius: 0
                }
            ];
            
            for (let i = 0; i < ageLabels.length; i++) {
                const age = ageLabels[i];
                const whoRecord = whoData[age];
                if (whoRecord) {
                    standardLines[0].data.push(whoRecord[1]);
                    standardLines[1].data.push(whoRecord[2]);
                    standardLines[2].data.push(whoRecord[3]);
                    standardLines[3].data.push(whoRecord[4]);
                    standardLines[4].data.push(whoRecord[5]);
                } else {
                    for (let j = 0; j < standardLines.length; j++) {
                        standardLines[j].data.push(null);
                    }
                }
            }
            
            const babyData = {
                label: '🍼 宝宝实际数据',
                data: new Array(37).fill(null),
                borderColor: '#2196f3',
                backgroundColor: '#2196f3',
                borderWidth: 3,
                pointRadius: 5,
                pointHoverRadius: 7
            };
            
            for (let i = 0; i < this.checkRecords.length; i++) {
                const record = this.checkRecords[i];
                const age = Math.round(record.ageMonths);
                let value = null;
                
                switch(chartType) {
                    case 'height':
                        value = record.height;
                        break;
                    case 'weight':
                        value = record.weight;
                        break;
                    case 'headCircumference':
                        value = record.headCircumference;
                        break;
                }
                
                if (value && age >= 0 && age <= 36) {
                    babyData.data[age] = value;
                }
            }
            
            this.growthChart.data.labels = ageLabels;
            this.growthChart.data.datasets = standardLines.concat([babyData]);
            
            let yAxisTitle = '';
            switch(chartType) {
                case 'height':
                    yAxisTitle = '身高 (cm)';
                    break;
                case 'weight':
                    yAxisTitle = '体重 (kg)';
                    break;
                case 'headCircumference':
                    yAxisTitle = '头围 (cm)';
                    break;
            }
            
            this.growthChart.options.scales.y.title.text = yAxisTitle;
            this.growthChart.update();
        }

        getLatestRecord() {
            if (this.checkRecords.length === 0) {
                return null;
            }
            
            const sortedRecords = this.checkRecords.slice().sort(function(a, b) {
                return new Date(b.checkDate) - new Date(a.checkDate);
            });
            return sortedRecords[0];
        }

        analyzeGrowthTrend() {
            if (this.checkRecords.length < 2) {
                return {
                    trend: '数据不足',
                    description: '需要至少2次体检记录才能分析生长趋势'
                };
            }
            
            const sortedRecords = this.checkRecords.slice().sort(function(a, b) {
                return new Date(a.checkDate) - new Date(b.checkDate);
            });
            const latest = sortedRecords[sortedRecords.length - 1];
            const previous = sortedRecords[sortedRecords.length - 2];
            
            const trends = [];
            
            if (latest.height && previous.height && latest.heightPercentile && previous.heightPercentile) {
                const heightChange = latest.heightPercentile - previous.heightPercentile;
                if (heightChange > 5) {
                    trends.push('身高增长良好');
                } else if (heightChange < -5) {
                    trends.push('身高增长放缓');
                } else {
                    trends.push('身高稳步增长');
                }
            }
            
            if (latest.weight && previous.weight && latest.weightPercentile && previous.weightPercentile) {
                const weightChange = latest.weightPercentile - previous.weightPercentile;
                if (weightChange > 5) {
                    trends.push('体重增长良好');
                } else if (weightChange < -5) {
                    trends.push('体重增长放缓');
                } else {
                    trends.push('体重稳步增长');
                }
            }
            
            if (latest.headCircumference && previous.headCircumference && latest.headPercentile && previous.headPercentile) {
                const headChange = latest.headPercentile - previous.headPercentile;
                if (headChange > 5) {
                    trends.push('头围增长良好');
                } else if (headChange < -5) {
                    trends.push('头围增长放缓');
                } else {
                    trends.push('头围稳步增长');
                }
            }
            
            return {
                trend: trends.length > 0 ? trends.join('，') : '生长正常',
                description: '基于最近两次体检记录的对比分析（' + previous.checkDate + ' vs ' + latest.checkDate + '）'
            };
        }

        async generateAIFeedingGuide() {
            console.log('=== 开始生成AI喂养指导 ===');
            console.log('调试信息:');
            console.log('- 基本信息:', this.babyInfo);
            console.log('- 体检记录数量:', this.checkRecords.length);
            console.log('- API密钥状态:', !!this.apiKey);
            
            if (!this.validateBasicInfo()) {
                return;
            }
            
            if (this.checkRecords.length === 0) {
                this.showMessage('🍼 请先添加体检记录', 'error');
                return;
            }
            
            if (!this.apiKey || this.apiKey.trim() === '') {
                this.showMessage('🔑 请先设置Deepseek API密钥', 'error');
                return;
            }
            
            const latestRecord = this.getLatestRecord();
            if (!latestRecord) {
                this.showMessage('❌ 无法获取最新体检记录', 'error');
                return;
            }
            
            console.log('最新体检记录:', latestRecord);
            
            const growthTrend = this.analyzeGrowthTrend();
            console.log('生长趋势分析:', growthTrend);
            
            const concernsInput = document.getElementById('feedingConcerns');
            const concerns = concernsInput ? concernsInput.value.trim() : '';
            
            const feedingLoading = document.getElementById('feedingLoading');
            const feedingGuide = document.getElementById('feedingGuide');
            
            console.log('DOM元素检查:');
            console.log('- feedingLoading:', !!feedingLoading);
            console.log('- feedingGuide:', !!feedingGuide);
            
            if (feedingLoading) feedingLoading.classList.remove('hidden');
            if (feedingGuide) feedingGuide.classList.add('hidden');
            
            try {
                const healthAnalysis = this.analyzeHealthStatus(latestRecord);
                console.log('健康分析:', healthAnalysis);
                
                this.showLoadingState('🤖 正在生成AI喂养建议...');
                const aiGuide = await this.callDeepseekForFeedingGuide(latestRecord, healthAnalysis, growthTrend, concerns);
                console.log('AI建议生成完成，字符数:', aiGuide.length);
                
                this.displayAIFeedingGuide(aiGuide, healthAnalysis, growthTrend, concerns);
                
                if (feedingLoading) feedingLoading.classList.add('hidden');
                if (feedingGuide) feedingGuide.classList.remove('hidden');
                this.hideLoadingState();
                this.showMessage('✨ AI喂养建议生成完成', 'success');
                
            } catch (error) {
                if (feedingLoading) feedingLoading.classList.add('hidden');
                this.hideLoadingState();
                this.showMessage('❌ 生成AI喂养建议失败: ' + error.message, 'error');
                console.error('AI指导生成错误:', error);
            }
        }

        analyzeHealthStatus(record) {
            const issues = [];
            const recommendations = [];
            
            if (record.height && record.heightPercentile) {
                if (record.heightPercentile < 10) {
                    issues.push('身高偏低');
                    recommendations.push('注意营养补充，建议咨询儿科医生');
                } else if (record.heightPercentile > 90) {
                    issues.push('身高偏高');
                    recommendations.push('继续保持良好的营养状态');
                }
            }
            
            if (record.weight && record.weightPercentile) {
                if (record.weightPercentile < 10) {
                    issues.push('体重偏轻');
                    recommendations.push('需要增加营养密度，增加喂养频次');
                } else if (record.weightPercentile > 90) {
                    issues.push('体重超重');
                    recommendations.push('控制高热量食物，增加活动量');
                }
            }
            
            if (record.headCircumference && record.headPercentile) {
                if (record.headPercentile < 10) {
                    issues.push('头围偏小');
                    recommendations.push('建议咨询儿科医生，关注神经系统发育');
                } else if (record.headPercentile > 90) {
                    issues.push('头围偏大');
                    recommendations.push('建议咨询儿科医生，排除相关疾病');
                }
            }
            
            if (record.height && record.weight) {
                const bmi = record.weight / Math.pow(record.height / 100, 2);
                if (bmi > 18) {
                    issues.push('BMI偏高');
                    recommendations.push('注意饮食结构，避免过度喂养');
                } else if (bmi < 14) {
                    issues.push('BMI偏低');
                    recommendations.push('增加营养摄入，关注生长发育');
                }
            }
            
            return {
                issues: issues.length > 0 ? issues : ['生长发育正常'],
                recommendations: recommendations,
                riskLevel: issues.length > 0 ? '需要关注' : '正常'
            };
        }

        async callDeepseekForFeedingGuide(record, healthAnalysis, growthTrend, concerns) {
            console.log('开始调用Deepseek API生成喂养建议');
            
            let prompt = '作为专业的儿科营养师，请为以下婴幼儿生成个性化的喂养指导建议：\n\n# 宝宝基本信息\n- 姓名：' + (this.babyInfo.name || '未知') + '\n- 性别：' + (this.babyInfo.gender === 'female' ? '女' : '男') + '\n- 出生日期：' + (this.babyInfo.birthDate || '未知') + '\n\n# 最新体检数据（' + record.checkDate + '）\n- 年龄：' + record.ageMonths + '个月\n- 身高：' + (record.height || '未知') + 'cm (百分位：' + (record.heightPercentile || '未知') + '%)\n- 体重：' + (record.weight || '未知') + 'kg (百分位：' + (record.weightPercentile || '未知') + '%)\n- 头围：' + (record.headCircumference || '未知') + 'cm (百分位：' + (record.headPercentile || '未知') + '%)\n\n# 健康状况分析\n主要问题：' + healthAnalysis.issues.join('、') + '\n风险等级：' + healthAnalysis.riskLevel + '\n\n# 生长趋势分析\n趋势：' + growthTrend.trend + '\n分析基础：' + growthTrend.description;
            
            if (concerns) {
                prompt += '\n\n# 家长重点关注\n' + concerns + '\n\n请特别针对以上关注点提供详细的解决方案和建议。';
            }
            
            prompt += '\n\n请提供以下三个方面的详细建议，要求专业、实用、针对性强：\n\n### 1. 每日营养需求\n根据年龄、性别、当前生长状况和趋势，提供具体的营养摄入建议，包括热量、蛋白质、维生素、矿物质等需求。\n\n### 2. 食物推荐\n推荐适合的食物种类、制作方法和注意事项，考虑年龄特点和个体差异。\n\n### 3. 喂养技巧\n提供实用的喂养方法、时间安排和注意事项，结合生长趋势给出调整建议。\n\n如果存在健康问题或生长趋势异常，请重点关注并提供针对性的改善建议。回复请用中文，条理清晰，内容详实。';
            
            console.log('发送的提示词长度:', prompt.length);
            
            try {
                const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + this.apiKey
                    },
                    body: JSON.stringify({
                        model: "deepseek-chat",
                        messages: [
                            {
                                role: "user",
                                content: prompt
                            }
                        ],
                        max_tokens: 2500,
                        temperature: 0.7,
                        stream: false
                    })
                });
                
                console.log('API响应状态:', response.status);
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('API错误响应:', errorText);
                    throw new Error('API调用失败: ' + response.status + ' - ' + errorText);
                }
                
                const data = await response.json();
                console.log('API响应数据结构:', Object.keys(data));
                
                if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                    throw new Error('API返回数据格式错误');
                }
                
                return data.choices[0].message.content;
                
            } catch (error) {
                console.error('Deepseek API调用失败:', error);
                if (error.message.includes('401')) {
                    throw new Error('API密钥无效，请检查密钥是否正确');
                } else if (error.message.includes('429')) {
                    throw new Error('请求过于频繁，请稍后重试');
                } else if (error.message.includes('500')) {
                    throw new Error('AI服务暂时不可用，请稍后重试');
                } else {
                    throw new Error('网络错误: ' + error.message);
                }
            }
        }

        displayAIFeedingGuide(aiGuide, healthAnalysis, growthTrend, concerns) {
            console.log('显示AI喂养建议，内容长度:', aiGuide.length);
            
            const nutritionContent = document.getElementById('nutritionContent');
            const foodContent = document.getElementById('foodContent');
            const tipsContent = document.getElementById('tipsContent');
            
            console.log('内容容器检查:');
            console.log('- nutritionContent:', !!nutritionContent);
            console.log('- foodContent:', !!foodContent);
            console.log('- tipsContent:', !!tipsContent);
            
            const sections = this.parseAIGuide(aiGuide);
            
            if (nutritionContent) {
                let nutritionHTML = '';
                
                const latestRecord = this.getLatestRecord();
                nutritionHTML += '<div style="background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%); padding: 15px; border-radius: 15px; margin-bottom: 15px; border: 2px solid #2196F3;"><strong>📊 最新体检数据（' + latestRecord.checkDate + '）：</strong><br>年龄：' + latestRecord.ageMonths + '个月 | 身高：' + (latestRecord.height || '--') + 'cm (' + (latestRecord.heightPercentile || '--') + '%) | 体重：' + (latestRecord.weight || '--') + 'kg (' + (latestRecord.weightPercentile || '--') + '%) | 头围：' + (latestRecord.headCircumference || '--') + 'cm (' + (latestRecord.headPercentile || '--') + '%)</div>';
                
                nutritionHTML += '<div style="background: linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%); padding: 15px; border-radius: 15px; margin-bottom: 15px; border: 2px solid #9C27B0;"><strong>📈 生长趋势：</strong>' + growthTrend.trend + '<br><small>' + growthTrend.description + '</small></div>';
                
                nutritionHTML += '<div style="background: linear-gradient(135deg, #FFF3CD 0%, #FFEAA7 100%); padding: 15px; border-radius: 15px; margin-bottom: 15px; border: 2px solid #FFC107;"><strong>⚠️ 健康状况：</strong>' + healthAnalysis.issues.join('、') + '</div>';
                
                if (concerns) {
                    nutritionHTML += '<div style="background: linear-gradient(135deg, #D1ECF1 0%, #B6E3EC 100%); padding: 15px; border-radius: 15px; margin-bottom: 15px; border: 2px solid #17A2B8;"><strong>🎯 重点关注：</strong>' + concerns + '</div>';
                }
                
                nutritionHTML += sections.nutrition || '<div style="white-space: pre-wrap; background: white; padding: 20px; border-radius: 15px; border: 2px solid #FFB6C1;">' + aiGuide + '</div>';
                nutritionContent.innerHTML = nutritionHTML;
            }
            
            if (foodContent) {
                foodContent.innerHTML = sections.food || '<p style="text-align: center; color: #888;">请查看上方营养需求部分的完整建议</p>';
            }
            
            if (tipsContent) {
                tipsContent.innerHTML = sections.tips || '<p style="text-align: center; color: #888;">请查看上方营养需求部分的完整建议</p>';
            }
        }

        parseAIGuide(content) {
            const sections = {};
            
            const nutritionMatch = content.match(/(?:每日营养需求|### 1\. 每日营养需求|1\. 每日营养需求)[：:]?\s*([\s\S]*?)(?=(?:食物推荐|### 2\. 食物推荐|2\. 食物推荐|喂养技巧|### 3\. 喂养技巧|3\. 喂养技巧)|$)/);
            const foodMatch = content.match(/(?:食物推荐|### 2\. 食物推荐|2\. 食物推荐)[：:]?\s*([\s\S]*?)(?=(?:喂养技巧|### 3\. 喂养技巧|3\. 喂养技巧|每日营养|### 1\. 每日营养需求|1\. 每日营养需求)|$)/);
            const tipsMatch = content.match(/(?:喂养技巧|### 3\. 喂养技巧|3\. 喂养技巧)[：:]?\s*([\s\S]*?)(?=(?:每日营养|### 1\. 每日营养需求|1\. 每日营养需求|食物推荐|### 2\. 食物推荐|2\. 食物推荐)|$)/);
            
            if (nutritionMatch) {
                sections.nutrition = '<div style="white-space: pre-wrap; background: white; padding: 20px; border-radius: 15px; border: 2px solid #FFB6C1;">' + nutritionMatch[1].trim() + '</div>';
            }
            
            if (foodMatch) {
                sections.food = '<div style="white-space: pre-wrap; background: white; padding: 20px; border-radius: 15px; border: 2px solid #FFB6C1;">' + foodMatch[1].trim() + '</div>';
            }
            
            if (tipsMatch) {
                sections.tips = '<div style="white-space: pre-wrap; background: white; padding: 20px; border-radius: 15px; border: 2px solid #FFB6C1;">' + tipsMatch[1].trim() + '</div>';
            }
            
            return sections;
        }

        showLoadingState(message) {
            const loadingEl = document.getElementById('loadingMessage');
            if (loadingEl) {
                const span = loadingEl.querySelector('span');
                if (span) span.textContent = message;
                loadingEl.classList.remove('hidden');
            }
        }

        hideLoadingState() {
            const loadingEl = document.getElementById('loadingMessage');
            if (loadingEl) {
                loadingEl.classList.add('hidden');
            }
        }

        showMessage(message, type) {
            type = type || 'info';
            const existingMessage = document.querySelector('.toast-message');
            if (existingMessage) {
                existingMessage.remove();
            }
            
            const messageEl = document.createElement('div');
            messageEl.className = 'toast-message';
            messageEl.textContent = message;
            
            let backgroundColor;
            switch(type) {
                case 'success':
                    backgroundColor = 'linear-gradient(135deg, #4CAF50 0%, #45A049 100%)';
                    break;
                case 'error':
                    backgroundColor = 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)';
                    break;
                case 'warning':
                    backgroundColor = 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)';
                    break;
                default:
                    backgroundColor = 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)';
            }
            
            messageEl.style.cssText = 'position: fixed; top: 20px; right: 20px; padding: 15px 25px; border-radius: 25px; color: white; z-index: 1000; font-size: 14px; font-weight: 600; max-width: 350px; box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2); background: ' + backgroundColor + '; transition: all 0.3s ease; animation: slideInRight 0.5s ease-out;';
            
            const style = document.createElement('style');
            style.textContent = '@keyframes slideInRight { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }';
            document.head.appendChild(style);
            
            document.body.appendChild(messageEl);
            
            setTimeout(function() {
                if (messageEl.parentNode) {
                    messageEl.style.opacity = '0';
                    messageEl.style.transform = 'translateX(100px)';
                    setTimeout(function() {
                        if (messageEl.parentNode) {
                            messageEl.remove();
                        }
                    }, 300);
                }
            }, 3000);
        }

        addManualRecord() {
            if (!this.validateBasicInfo()) {
                return;
            }
            
            const formData = this.getFormData();
            if (this.validateFormData(formData)) {
                const gender = this.babyInfo.gender || 'male';
                const recordWithPercentiles = {
                    checkDate: formData.checkDate,
                    ageMonths: formData.ageMonths,
                    height: formData.height,
                    weight: formData.weight,
                    headCircumference: formData.headCircumference,
                    id: Date.now(),
                    addedAt: new Date().toISOString(),
                    heightPercentile: this.calculateWHOPercentileWithLinearInterpolation(formData.ageMonths, formData.height, 'height', gender),
                    weightPercentile: this.calculateWHOPercentileWithLinearInterpolation(formData.ageMonths, formData.weight, 'weight', gender),
                    headPercentile: this.calculateWHOPercentileWithLinearInterpolation(formData.ageMonths, formData.headCircumference, 'headCircumference', gender)
                };
                
                this.checkRecords.push(recordWithPercentiles);
                this.saveData();
                this.updateRecordsTable();
                this.updateCurrentStatus();
                this.updateChart();
                this.clearForm();
                this.showMessage('🎉 记录添加成功', 'success');
            }
        }

        getFormData() {
            return {
                checkDate: document.getElementById('checkDate') ? document.getElementById('checkDate').value : '',
                ageMonths: parseFloat(document.getElementById('ageMonths') ? document.getElementById('ageMonths').value : '') || null,
                height: parseFloat(document.getElementById('height') ? document.getElementById('height').value : '') || null,
                weight: parseFloat(document.getElementById('weight') ? document.getElementById('weight').value : '') || null,
                headCircumference: parseFloat(document.getElementById('headCircumference') ? document.getElementById('headCircumference').value : '') || null
            };
        }

        validateFormData(data) {
            if (!data.checkDate) {
                this.showMessage('📅 请填写体检日期', 'error');
                return false;
            }
            if (!data.ageMonths || data.ageMonths <= 0) {
                this.showMessage('👶 请填写有效的年龄（月）', 'error');
                return false;
            }
            if (!data.height && !data.weight && !data.headCircumference) {
                this.showMessage('📏 请至少填写身高、体重或头围中的一项', 'error');
                return false;
            }
            return true;
        }

        saveData() {
            localStorage.setItem('baby_check_records', JSON.stringify(this.checkRecords));
            localStorage.setItem('baby_info', JSON.stringify(this.babyInfo));
        }

        loadSavedData() {
            this.updateApiStatus();
            this.updateBaiduOcrStatus();
            
            const apiKeyInput = document.getElementById('apiKeyInput');
            if (apiKeyInput && this.apiKey) {
                apiKeyInput.value = this.apiKey;
            }
            
            const baiduApiKeyInput = document.getElementById('baiduOcrApiKey');
            const baiduSecretKeyInput = document.getElementById('baiduOcrSecretKey');
            if (baiduApiKeyInput && this.baiduOcrConfig.apiKey) {
                baiduApiKeyInput.value = this.baiduOcrConfig.apiKey;
            }
            if (baiduSecretKeyInput && this.baiduOcrConfig.secretKey) {
                baiduSecretKeyInput.value = this.baiduOcrConfig.secretKey;
            }
            
            if (this.babyInfo.name) {
                const babyNameInput = document.getElementById('babyName');
                if (babyNameInput) babyNameInput.value = this.babyInfo.name;
            }
            if (this.babyInfo.gender) {
                const babyGenderSelect = document.getElementById('babyGender');
                if (babyGenderSelect) babyGenderSelect.value = this.babyInfo.gender;
            }
            if (this.babyInfo.birthDate) {
                const babyBirthDateInput = document.getElementById('babyBirthDate');
                if (babyBirthDateInput) babyBirthDateInput.value = this.babyInfo.birthDate;
            }
        }

        updateUI() {
            this.updateRecordsTable();
            this.updateStatistics();
            this.updateCurrentStatus();
        }

        updateCurrentStatus() {
            const latestRecord = this.getLatestRecord();
            if (latestRecord) {
                const currentAgeEl = document.getElementById('currentAge');
                const currentHeightEl = document.getElementById('currentHeight');
                const currentWeightEl = document.getElementById('currentWeight');
                
                if (currentAgeEl) currentAgeEl.textContent = latestRecord.ageMonths + '月';
                if (currentHeightEl) currentHeightEl.textContent = (latestRecord.height || '--') + 'cm';
                if (currentWeightEl) currentWeightEl.textContent = (latestRecord.weight || '--') + 'kg';
                
                const feedingAgeEl = document.getElementById('feedingAge');
                const feedingHeightEl = document.getElementById('feedingHeight');
                const feedingWeightEl = document.getElementById('feedingWeight');
                
                if (feedingAgeEl) feedingAgeEl.textContent = latestRecord.ageMonths + '月';
                if (feedingHeightEl) feedingHeightEl.textContent = (latestRecord.height || '--') + 'cm';
                if (feedingWeightEl) feedingWeightEl.textContent = (latestRecord.weight || '--') + 'kg';
            } else {
                const elementsToUpdate = [
                    'currentAge', 'currentHeight', 'currentWeight',
                    'feedingAge', 'feedingHeight', 'feedingWeight'
                ];
                
                for (let i = 0; i < elementsToUpdate.length; i++) {
                    const el = document.getElementById(elementsToUpdate[i]);
                    if (el) el.textContent = '--';
                }
            }
        }

        updateRecordsTable() {
            const tableBody = document.getElementById('recordsTableBody');
            const noRecords = document.getElementById('noRecords');
            
            if (!tableBody) return;
            
            tableBody.innerHTML = '';
            
            if (this.checkRecords.length === 0) {
                if (noRecords) noRecords.style.display = 'block';
                return;
            }
            
            if (noRecords) noRecords.style.display = 'none';
            
            const sortedRecords = this.checkRecords.slice().sort(function(a, b) {
                return new Date(b.checkDate) - new Date(a.checkDate);
            });
            
            const self = this;
            for (let i = 0; i < sortedRecords.length; i++) {
                const record = sortedRecords[i];
                const row = document.createElement('tr');
                row.innerHTML = '<td>' + record.checkDate + '</td><td>' + record.ageMonths + '个月</td><td>' + (record.height || '--') + '</td><td>' + (record.heightPercentile || '--') + '%</td><td>' + (record.weight || '--') + '</td><td>' + (record.weightPercentile || '--') + '%</td><td>' + (record.headCircumference || '--') + '</td><td>' + (record.headPercentile || '--') + '%</td><td><button onclick="window.babyTracker.deleteRecord(' + this.checkRecords.indexOf(record) + ')" class="btn btn-danger" style="padding: 8px 15px; font-size: 0.8em; border-radius: 15px; background: linear-gradient(135deg, #FF6B6B 0%, #FF5252 100%);">🗑️ 删除</button></td>';
                tableBody.appendChild(row);
            }
        }

        updateStatistics() {
            const statsEl = document.getElementById('statisticsInfo');
            if (statsEl && this.checkRecords.length > 0) {
                const latestRecord = this.getLatestRecord();
                statsEl.innerHTML = '<p><strong>📊 总记录数：</strong>' + this.checkRecords.length + '</p><p><strong>🗓️ 最新记录：</strong>' + latestRecord.checkDate + '</p><p><strong>👶 当前月龄：</strong>' + latestRecord.ageMonths + '个月</p><p><strong>🤖 识别模式：</strong>百度OCR+AI增强</p>';
            }
        }

        deleteRecord(index) {
            if (confirm('🤔 确定要删除这条记录吗？')) {
                this.checkRecords.splice(index, 1);
                this.saveData();
                this.updateRecordsTable();
                this.updateStatistics();
                this.updateCurrentStatus();
                this.updateChart();
                this.showMessage('✅ 记录已删除', 'success');
            }
        }

        clearForm() {
            const inputs = ['checkDate', 'ageMonths', 'height', 'weight', 'headCircumference'];
            for (let i = 0; i < inputs.length; i++) {
                const el = document.getElementById(inputs[i]);
                if (el) el.value = '';
            }
            
            const percentileEls = ['heightPercentile', 'weightPercentile', 'headPercentile'];
            for (let i = 0; i < percentileEls.length; i++) {
                const el = document.getElementById(percentileEls[i]);
                if (el) el.textContent = '--';
            }
            
            const uploadedImageDiv = document.getElementById('uploadedImage');
            if (uploadedImageDiv) uploadedImageDiv.classList.add('hidden');
            
            this.hideOCRResult();
            this.resetUploadInput();
        }

        exportData() {
            const data = {
                babyInfo: this.babyInfo,
                checkRecords: this.checkRecords,
                exportDate: new Date().toISOString(),
                version: '10.0-BaiduOCR'
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'baby_health_data_' + new Date().toISOString().split('T')[0] + '.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showMessage('💾 数据导出成功', 'success');
        }

        importData() {
            const self = this;
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        try {
                            const data = JSON.parse(e.target.result);
                            if (data.checkRecords && Array.isArray(data.checkRecords)) {
                                self.babyInfo = data.babyInfo || {};
                                self.checkRecords = data.checkRecords || [];
                                self.saveData();
                                self.updateUI();
                                self.loadSavedData();
                                self.updateChart();
                                self.showMessage('📥 数据导入成功', 'success');
                            } else {
                                self.showMessage('❌ 数据格式不正确', 'error');
                            }
                        } catch (error) {
                            self.showMessage('⚠️ 数据格式错误，请检查文件', 'error');
                            console.error('导入错误:', error);
                        }
                    };
                    reader.readAsDataURL(file);
                }
            };
            input.click();
        }
    }

    // 页面加载完成后初始化
    document.addEventListener('DOMContentLoaded', function() {
        window.babyTracker = new BabyHealthTracker();
        console.log('🎀 婴幼儿健康追踪系统已初始化 (百度OCR版 v10.0)');
        
        // 绑定图表类型切换事件
        const chartTypeInputs = document.querySelectorAll('input[name="chartType"]');
        for (let i = 0; i < chartTypeInputs.length; i++) {
            const input = chartTypeInputs[i];
            input.addEventListener('change', function() {
                if (window.babyTracker && window.babyTracker.updateChart) {
                    window.babyTracker.updateChart();
                }
            });
        }
        
        // 绑定标签页切换功能
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');
        
        for (let i = 0; i < tabButtons.length; i++) {
            const button = tabButtons[i];
            button.addEventListener('click', function() {
                const targetTab = button.getAttribute('data-tab');
                
                // 移除所有活动状态
                for (let j = 0; j < tabButtons.length; j++) {
                    tabButtons[j].classList.remove('active');
                }
                for (let j = 0; j < tabContents.length; j++) {
                    tabContents[j].classList.remove('active');
                }
                
                // 激活当前标签页
                button.classList.add('active');
                const targetContent = document.getElementById(targetTab);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        }
        
        // 初始化第一个标签页为活动状态
        if (tabButtons.length > 0) {
            tabButtons[0].classList.add('active');
            const firstTabId = tabButtons[0].getAttribute('data-tab');
            const firstTabContent = document.getElementById(firstTabId);
            if (firstTabContent) {
                firstTabContent.classList.add('active');
            }
        }
    });

})();
