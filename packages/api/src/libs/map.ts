import { env } from "../env";

class MapClient {
  hasApiKey() {
    return Boolean(env.GOONG_MAP_API_KEY);
  }

  async geocode(address: string): Promise<GoongGeocodeResponse | null> {
    if (!this.hasApiKey() || !address.trim()) {
      return null;
    }

    try {
      const response = await fetch(
        `https://rsapi.goong.io/geocode?address=${encodeURIComponent(address)}&api_key=${env.GOONG_MAP_API_KEY}`,
      );

      if (!response.ok) {
        return null;
      }

      return (await response.json()) as GoongGeocodeResponse;
    } catch {
      return null;
    }
  }

  async reverseGeocode(
    lat: number,
    lng: number,
  ): Promise<GoongReverseGeocodeResponse | null> {
    if (!this.hasApiKey()) {
      return null;
    }

    try {
      const response = await fetch(
        `https://rsapi.goong.io/Geocode?latlng=${lat},${lng}&api_key=${env.GOONG_MAP_API_KEY}`,
      );

      if (!response.ok) {
        return null;
      }

      return (await response.json()) as GoongReverseGeocodeResponse;
    } catch {
      return null;
    }
  }
}

export const mapClient = new MapClient();
export type { MapClient };

export interface GoongAddressComponent {
  long_name: string;
  short_name: string;
}

export interface GoongGeometry {
  location: {
    lat: number;
    lng: number;
  };
  boundary: unknown | null;
}

export interface GoongPlusCode {
  compound_code: string;
  global_code: string;
}

export interface GoongCompound {
  district?: string;
  commune?: string;
  province?: string;
}

export interface GoongGeocodeResult {
  address_components: GoongAddressComponent[];
  formatted_address: string;
  geometry: GoongGeometry;
  place_id: string;
  reference: string;
  plus_code: GoongPlusCode;
  compound: GoongCompound;
  types: string[];
  name: string;
  address: string;
}

export interface GoongGeocodeResponse {
  results: GoongGeocodeResult[];
  status: string;
}

export interface GoongReverseGeocodeResult {
  address_components: GoongAddressComponent[];
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  place_id: string;
  reference: string;
  plus_code: GoongPlusCode;
  types: string[];
}

export interface GoongReverseGeocodeResponse {
  plus_code: Record<string, unknown>;
  results: GoongReverseGeocodeResult[];
  status: string;
}
