/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Owner = string;
export type Market = string;
export type AssetType = 'stock' | 'futures' | 'cash';

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
}

export const MOCK_DATA: PortfolioItem[] = [
  {
    owner: '爸',
    id: '0050',
    share: 12811,
    price: 195.5,
    _value: 1240745.35,
    value: 1240745.35,
    _exposure: 1240745.35,
    exposure: 1240745.35,
    _change: -640.55,
    change: -640.55,
    market: 'TW',
    bank: '永豐金',
    type: 'stock'
  },
  {
    owner: '爸',
    id: '2330',
    share: 5000,
    price: 940,
    _value: 4700000,
    value: 4700000,
    _exposure: 4700000,
    exposure: 4700000,
    _change: 25000,
    change: 25000,
    market: 'TW',
    bank: '永豐金',
    type: 'stock'
  },
  {
    owner: '媽',
    id: '0056',
    share: 20000,
    price: 38.5,
    _value: 770000,
    value: 770000,
    _exposure: 770000,
    exposure: 770000,
    _change: 1200,
    change: 1200,
    market: 'TW',
    bank: '國泰',
    type: 'stock'
  },
  {
    owner: '小孩',
    id: 'NVDA',
    share: 150,
    price: 110.5,
    _value: 16575,
    value: 538687.5,
    _exposure: 16575,
    exposure: 538687.5,
    _change: 450,
    change: 14625,
    market: 'US',
    bank: 'Firstrade',
    type: 'stock'
  },
  {
    owner: '爸',
    id: 'TXF',
    share: 1,
    price: 22000,
    _value: 0,
    value: 0,
    _exposure: 4400000,
    exposure: 4400000,
    _change: -5000,
    change: -5000,
    market: 'TW',
    bank: '群益',
    type: 'futures'
  },
  {
    owner: '媽',
    id: '2317',
    share: 10000,
    price: 180,
    _value: 1800000,
    value: 1800000,
    _exposure: 1800000,
    exposure: 1800000,
    _change: -2000,
    change: -2000,
    market: 'TW',
    bank: '國泰',
    type: 'stock'
  },
  {
    owner: '爸',
    id: '現金',
    share: 500000,
    price: 1,
    _value: 500000,
    value: 500000,
    _exposure: 0,
    exposure: 0,
    _change: 0,
    change: 0,
    market: 'TW',
    bank: '永豐金',
    type: 'cash'
  },
  {
    owner: '媽',
    id: 'USD',
    share: 10000,
    price: 32.5,
    _value: 10000,
    value: 325000,
    _exposure: 0,
    exposure: 0,
    _change: 0,
    change: 0,
    market: 'US',
    bank: '富邦',
    type: 'cash'
  }
];
