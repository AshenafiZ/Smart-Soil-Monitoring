// types/geojson.d.ts

export interface GeoJSONFeature {
    type: string;
    properties: {
      OBJECTID: number;
      REGIONNAME: string;
      ZONENAME: string;
      WOREDANO_: string;
      WOREDANAME: string;
      GlobalID: string;
      Shape__Area: number;
      Shape__Length: number;
    };
    geometry: {
      type: string;
      coordinates: number[][][]; // MultiPolygon type will have nested arrays
    };
  }
  
  export interface GeoJSONData {
    type: string;
    name: string;
    crs: object;
    features: GeoJSONFeature[];
  }
  