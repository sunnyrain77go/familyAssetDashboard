/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Owner = string;
export type Market = string;
export type AssetType = string;

export interface PortfolioItem {
  owner: Owner;
  id: string;
  share: number;
  price: number;
  _value: number; // 原幣市值
  value: number;  // 台幣市值
  _exposure: number; // 原幣曝險
  exposure: number;  // 台幣曝險
  _change: number;   // 原幣市值變動
  change: number;    // 台幣市值變動
  market: Market;
  bank: string;
  type: AssetType;
  subcat?: string;
}

export const MOCK_DATA: PortfolioItem[] = [
  { owner: "宗", id: "0050", share: 13100, price: 107.3, _value: 1405630, value: 1405630, _exposure: 1405630, exposure: 1405630, _change: 17030, change: 17030, market: "TW", bank: "永豐金", type: "台股", subcat: "B1" },
  { owner: "宗", id: "00631L", share: 1200, price: 38.33, _value: 45996, value: 45996, _exposure: 91992, exposure: 91992, _change: 984, change: 984, market: "TW", bank: "永豐金", type: "槓桿ETF", subcat: "B4" },
  { owner: "宗", id: "QQQ", share: 8, price: 722.51, _value: 5780.08, value: 182722.779, _exposure: 5780.08, exposure: 182722.779, _change: 0, change: 0, market: "US", bank: "彰銀複委託", type: "美股/全球", subcat: "B2" },
  { owner: "宗", id: "NTD", share: 70692, price: 1, _value: 70692, value: 70692, _exposure: 0, exposure: 0, _change: 0, change: 0, market: "Cash", bank: "永豐台幣", type: "自由現金", subcat: "A1" },
  { owner: "宗", id: "USD", share: 4033, price: 1, _value: 4033, value: 127493.2125, _exposure: 0, exposure: 0, _change: 0, change: 0, market: "Cash", bank: "永豐美金", type: "自由現金", subcat: "A1" },
  { owner: "宗", id: "NTD", share: 22899, price: 1, _value: 22899, value: 22899, _exposure: 0, exposure: 0, _change: 0, change: 0, market: "Cash", bank: "大戶台幣", type: "自由現金", subcat: "A1" },
  { owner: "宗", id: "NTD", share: 31609, price: 1, _value: 31609, value: 31609, _exposure: 0, exposure: 0, _change: 0, change: 0, market: "Cash", bank: "彰銀台幣", type: "自由現金", subcat: "A1" },
  { owner: "宗", id: "USD", share: 1452, price: 1, _value: 1452, value: 45901.35, _exposure: 0, exposure: 0, _change: 0, change: 0, market: "Cash", bank: "彰銀美金", type: "自由現金", subcat: "A1" },
  { owner: "宗", id: "USD", share: 33700, price: 1, _value: 33700, value: 1065341.25, _exposure: 0, exposure: 0, _change: 0, change: 0, market: "Cash", bank: "南山保險", type: "儲蓄保單", subcat: "D1" },
  { owner: "宗", id: "NTD", share: -140000, price: 1, _value: -140000, value: -140000, _exposure: 0, exposure: 0, _change: 0, change: 0, market: "Cash", bank: "股票質押", type: "股票質押", subcat: "F1" },
  { owner: "宗", id: "NTD", share: 52080, price: 1, _value: 52080, value: 52080, _exposure: 0, exposure: 0, _change: 0, change: 0, market: "Cash", bank: "退休金(勞退)", type: "退休金", subcat: "E2" },
  { owner: "均宸", id: "0050", share: 806, price: 107.3, _value: 86483.8, value: 86483.8, _exposure: 86483.8, exposure: 86483.8, _change: 1047.8, change: 1047.8, market: "TW", bank: "永豐金", type: "台股", subcat: "B1" },
  { owner: "均宸", id: "0050", share: 16000, price: 107.3, _value: 1716800, value: 1716800, _exposure: 1716800, exposure: 1716800, _change: 20800, change: 20800, market: "TW", bank: "國泰", type: "台股", subcat: "B1" },
  { owner: "均宸", id: "00830", share: 398, price: 97, _value: 38606, value: 38606, _exposure: 38606, exposure: 38606, _change: 557.2, change: 557.2, market: "US", bank: "國泰", type: "美股/全球", subcat: "B2" },
  { owner: "均宸", id: "NTD", share: 800, price: 1, _value: 800, value: 800, _exposure: 0, exposure: 0, _change: 0, change: 0, market: "Cash", bank: "永豐台幣", type: "自由現金", subcat: "A1" },
  { owner: "婷", id: "2330", share: 600, price: 2410, _value: 0, value: 0, _exposure: 1446000, exposure: 1446000, _change: 15000, change: 15000, market: "TW", bank: "群益期貨", type: "期貨合約", subcat: "C2" },
  { owner: "婷", id: "NTD", share: 11000, price: 1, _value: 11000, value: 11000, _exposure: 0, exposure: 0, _change: 0, change: 0, market: "Cash", bank: "群益期貨", type: "期貨保證金", subcat: "C1" },
  { owner: "婷", id: "SOXX", share: 2, price: 599.73, _value: 1199.46, value: 37917.92925, _exposure: 1199.46, exposure: 37917.92925, _change: 0, change: 0, market: "US", bank: "國泰複委託", type: "美股/全球", subcat: "B2" },
  { owner: "婷", id: "MSFT", share: 0.12363, price: 378.91, _value: 46.8446433, value: 1480.876286, _exposure: 46.8446433, exposure: 1480.876286, _change: 0, change: 0, market: "US", bank: "國泰複委託", type: "美股/全球", subcat: "B2" },
  { owner: "婷", id: "Cryptoassets", share: 79263.792, price: 1, _value: 79263.792, value: 79263.792, _exposure: 0, exposure: 0, _change: 0, change: 0, market: "Cash", bank: "加密貨幣", type: "加密貨幣", subcat: "A2" },
  { owner: "婷", id: "2317", share: 881, price: 268.5, _value: 236548.5, value: 236548.5, _exposure: 236548.5, exposure: 236548.5, _change: -3083.5, change: -3083.5, market: "TW", bank: "群益", type: "台股", subcat: "B1" },
  { owner: "婷", id: "2382", share: 34, price: 376, _value: 12784, value: 12784, _exposure: 12784, exposure: 12784, _change: 68, change: 68, market: "TW", bank: "群益", type: "台股", subcat: "B1" },
  { owner: "婷", id: "2449", share: 52, price: 308.5, _value: 16042, value: 16042, _exposure: 16042, exposure: 16042, _change: 1456, change: 1456, market: "TW", bank: "群益", type: "台股", subcat: "B1" },
  { owner: "婷", id: "USD", share: 12241, price: 1, _value: 12241, value: 386968.6125, _exposure: 0, exposure: 0, _change: 0, change: 0, market: "Cash", bank: "FT", type: "自由現金", subcat: "A1" },
  { owner: "婷", id: "BAH", share: 25, price: 71.1, _value: 1777.5, value: 56191.21875, _exposure: 1777.5, exposure: 56191.21875, _change: 0.5, change: 15.80625, market: "US", bank: "FT", type: "美股/全球", subcat: "B2" },
  { owner: "婷", id: "BND", share: 15, price: 73.14, _value: 1097.1, value: 34682.07375, _exposure: 1097.1, exposure: 34682.07375, _change: 0, change: 0, market: "US", bank: "FT", type: "債券ETF", subcat: "B3" },
  { owner: "婷", id: "CPRT", share: 4, price: 29.52, _value: 118.08, value: 3732.804, _exposure: 118.08, exposure: 3732.804, _change: 0, change: 0, market: "US", bank: "FT", type: "美股/全球", subcat: "B2" },
  { owner: "婷", id: "FDS", share: 6, price: 228.3, _value: 1369.8, value: 43302.8025, _exposure: 1369.8, exposure: 43302.8025, _change: 0, change: 0, market: "US", bank: "FT", type: "美股/全球", subcat: "B2" },
  { owner: "婷", id: "IAU", share: 38, price: 79.64, _value: 3026.32, value: 95669.541, _exposure: 3026.32, exposure: 95669.541, _change: 0, change: 0, market: "Global", bank: "FT", type: "商品ETF", subcat: "B5" },
  { owner: "婷", id: "PDBC", share: 46.6, price: 16.54, _value: 770.764, value: 24365.77695, _exposure: 770.764, exposure: 24365.77695, _change: 0, change: 0, market: "Global", bank: "FT", type: "商品ETF", subcat: "B5" },
  { owner: "婷", id: "TQQQ", share: 250, price: 77.54, _value: 19385, value: 612808.3125, _exposure: 58155, exposure: 1838424.938, _change: 0, change: 0, market: "US", bank: "FT", type: "槓桿ETF", subcat: "B4" },
  { owner: "婷", id: "UGL", share: 50, price: 48.94, _value: 2447, value: 77355.7875, _exposure: 4894, exposure: 154711.575, _change: 0, change: 0, market: "US", bank: "FT", type: "槓桿ETF", subcat: "B4" },
  { owner: "婷", id: "URTY", share: 85, price: 79.03, _value: 6717.55, value: 212358.5494, _exposure: 20152.65, exposure: 637075.6481, _change: 0, change: 0, market: "US", bank: "FT", type: "槓桿ETF", subcat: "B4" },
  { owner: "婷", id: "VCLT", share: 368.5, price: 75.17, _value: 27700.145, value: 875670.8338, _exposure: 27700.145, exposure: 875670.8338, _change: 0, change: 0, market: "US", bank: "FT", type: "債券ETF", subcat: "B3" },
  { owner: "婷", id: "VWO", share: 0, price: 59.81, _value: 0, value: 0, _exposure: 0, exposure: 0, _change: 0, change: 0, market: "Global", bank: "FT", type: "商品ETF", subcat: "B5" },
  { owner: "婷", id: "XLP", share: 44.9, price: 83.68, _value: 3757.232, value: 118775.4966, _exposure: 3757.232, exposure: 118775.4966, _change: 0, change: 0, market: "US", bank: "FT", type: "美股/全球", subcat: "B2" },
  { owner: "婷", id: "NTD", share: -712000, price: 1, _value: -712000, value: -712000, _exposure: 0, exposure: 0, _change: 0, change: 0, market: "Cash", bank: "信貸", type: "信貸", subcat: "F2" },
  { owner: "婷", id: "NTD", share: 1680000, price: 1, _value: 1680000, value: 1680000, _exposure: 0, exposure: 0, _change: 0, change: 0, market: "Cash", bank: "預售屋", type: "不動產", subcat: "E1" },
  { owner: "婷", id: "NTD", share: 533000, price: 1, _value: 533000, value: 533000, _exposure: 0, exposure: 0, _change: 0, change: 0, market: "Cash", bank: "退休金(員持)", type: "退休金", subcat: "E2" },
  { owner: "婷", id: "NTD", share: 40000, price: 1, _value: 40000, value: 40000, _exposure: 0, exposure: 0, _change: 0, change: 0, market: "Cash", bank: "將來", type: "自由現金", subcat: "A1" },
  { owner: "婷", id: "NTD", share: 0, price: 1, _value: 0, value: 0, _exposure: 0, exposure: 0, _change: 0, change: 0, market: "Cash", bank: "郵局", type: "自由現金", subcat: "A1" },
  { owner: "婷", id: "NTD", share: 200000, price: 1, _value: 200000, value: 200000, _exposure: 0, exposure: 0, _change: 0, change: 0, market: "Cash", bank: "台銀", type: "自由現金", subcat: "A1" },
  { owner: "婷", id: "USD", share: 7605, price: 1, _value: 7605, value: 240413.0625, _exposure: 0, exposure: 0, _change: 0, change: 0, market: "Cash", bank: "外幣定存國泰", type: "自由現金", subcat: "A1" }
];
