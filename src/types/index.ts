// FMP Stock Quote API 응답 필드와 1:1 매핑
export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  changesPercentage: number;
  change: number;
  dayLow: number;
  dayHigh: number;
  yearHigh: number;
  yearLow: number;
  marketCap: number;
  priceAvg50: number;
  priceAvg200: number;
  volume: number;
  avgVolume: number;
  exchange: string;
  open: number;
  previousClose: number;
  eps: number;
  pe: number;
  sharesOutstanding: number;
  timestamp: number;
}

export interface CompanyProfile extends StockQuote {
  companyName: string;
  industry: string;
  sector: string;
  ceo: string;
  description: string;
  website: string;
  image: string;
  pbr: number;
  dividend: number;
}

export interface MarketIndex {
  symbol: string;
  name: string;
  price: number;
  changesPercentage: number;
  change: number;
}

export interface InstitutionalHolding {
  date: string;
  filingDate: string;
  cik: string;
  symbol: string;
  nameOfIssuer: string;
  shares: number;
  titleOfClass: string;
  value: number;
  weight: number;
  lastWeight: number;
  changeInWeight: number;
  changeInWeightPercentage: number;
  sharesNumber: number;
  lastSharesNumber: number;
  changeInSharesNumber: number;
  changeInSharesNumberPercentage: number;
  isNew: boolean;
  isSoldOut: boolean;
}

export interface HouseTrading {
  symbol: string;
  disclosureDate: string;
  transactionDate: string;
  firstName: string;
  lastName: string;
  office: string;
  owner: string;
  type: string;
  amount: string;
  link: string;
}

export type GuruType = "institutional" | "congress" | "pension";

export interface Guru {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  type: GuruType;
  returnRate: number;
}

export interface Sector {
  id: string;
  name: string;
  stocks: StockQuote[];
}

export interface GuruDetail extends Guru {
  holdings: InstitutionalHolding[];
  trades?: HouseTrading[];
}
