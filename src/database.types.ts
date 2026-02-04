export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      landmark: {
        Row: {
          contentid: number;
          contenttypeid: number | null;
          title: string;
          addr1: string | null;
          addr2: string | null;
          zipcode: string | null;
          tel: string | null;
          areacode: number | null;
          sigungucode: number | null;
          cat1: string | null;
          cat2: string | null;
          cat3: string | null;
          mapx: number | null;
          mapy: number | null;
          mlevel: number | null;
          firstimage: string | null;
          firstimage2: string | null;
          cpyrhtdivcd: string | null;
          createdtime: string | null;
          modifiedtime: string | null;
          ldongregncd: number | null;
          ldongsigngucd: number | null;
          lclssystm1: string | null;
          lclssystm2: string | null;
          lclssystm3: string | null;
        };
        Insert: {
          contentid: number;
          contenttypeid?: number | null;
          title: string;
          addr1?: string | null;
          addr2?: string | null;
          zipcode?: string | null;
          tel?: string | null;
          areacode?: number | null;
          sigungucode?: number | null;
          cat1?: string | null;
          cat2?: string | null;
          cat3?: string | null;
          mapx?: number | null;
          mapy?: number | null;
          mlevel?: number | null;
          firstimage?: string | null;
          firstimage2?: string | null;
          cpyrhtdivcd?: string | null;
          createdtime?: string | null;
          modifiedtime?: string | null;
          ldongregncd?: number | null;
          ldongsigngucd?: number | null;
          lclssystm1?: string | null;
          lclssystm2?: string | null;
          lclssystm3?: string | null;
        };
        Update: {
          contentid?: number;
          contenttypeid?: number | null;
          title?: string;
          addr1?: string | null;
          addr2?: string | null;
          zipcode?: string | null;
          tel?: string | null;
          areacode?: number | null;
          sigungucode?: number | null;
          cat1?: string | null;
          cat2?: string | null;
          cat3?: string | null;
          mapx?: number | null;
          mapy?: number | null;
          mlevel?: number | null;
          firstimage?: string | null;
          firstimage2?: string | null;
          cpyrhtdivcd?: string | null;
          createdtime?: string | null;
          modifiedtime?: string | null;
          ldongregncd?: number | null;
          ldongsigngucd?: number | null;
          lclssystm1?: string | null;
          lclssystm2?: string | null;
          lclssystm3?: string | null;
        };
        Relationships: [];
      };
      landmark_detail: {
        Row: {
          contentid: number;
          contenttypeid: number | null;
          title: string;
          addr1: string | null;
          addr2: string | null;
          zipcode: string | null;
          tel: string | null;
          areacode: number | null;
          sigungucode: number | null;
          cat1: string | null;
          cat2: string | null;
          cat3: string | null;
          mapx: number | null;
          mapy: number | null;
          mlevel: number | null;
          firstimage: string | null;
          firstimage2: string | null;
          cpyrhtdivcd: string | null;
          createdtime: string | null;
          modifiedtime: string | null;
          ldongregncd: number | null;
          ldongsigngucd: number | null;
          lclssystm1: string | null;
          lclssystm2: string | null;
          lclssystm3: string | null;
          homepage: string | null;
          overview: string | null;
        };
        Insert: {
          contentid: number;
          contenttypeid?: number | null;
          title: string;
          addr1?: string | null;
          addr2?: string | null;
          zipcode?: string | null;
          tel?: string | null;
          areacode?: number | null;
          sigungucode?: number | null;
          cat1?: string | null;
          cat2?: string | null;
          cat3?: string | null;
          mapx?: number | null;
          mapy?: number | null;
          mlevel?: number | null;
          firstimage?: string | null;
          firstimage2?: string | null;
          cpyrhtdivcd?: string | null;
          createdtime?: string | null;
          modifiedtime?: string | null;
          ldongregncd?: number | null;
          ldongsigngucd?: number | null;
          lclssystm1?: string | null;
          lclssystm2?: string | null;
          lclssystm3?: string | null;
          homepage?: string | null;
          overview?: string | null;
        };
        Update: {
          contentid?: number;
          contenttypeid?: number | null;
          title?: string;
          addr1?: string | null;
          addr2?: string | null;
          zipcode?: string | null;
          tel?: string | null;
          areacode?: number | null;
          sigungucode?: number | null;
          cat1?: string | null;
          cat2?: string | null;
          cat3?: string | null;
          mapx?: number | null;
          mapy?: number | null;
          mlevel?: number | null;
          firstimage?: string | null;
          firstimage2?: string | null;
          cpyrhtdivcd?: string | null;
          createdtime?: string | null;
          modifiedtime?: string | null;
          ldongregncd?: number | null;
          ldongsigngucd?: number | null;
          lclssystm1?: string | null;
          lclssystm2?: string | null;
          lclssystm3?: string | null;
          homepage?: string | null;
          overview?: string | null;
        };
        Relationships: [];
      };
      landmark_image: {
        Row: {
          id: number;
          contentid: number;
          originimgurl: string;
          imgname: string;
          smallimageurl: string | null;
          cpyrhtdivcd: string | null;
          serialnum: string | null;
        };
        Insert: {
          id?: number;
          contentid: number;
          originimgurl: string;
          imgname: string;
          smallimageurl?: string | null;
          cpyrhtdivcd?: string | null;
          serialnum?: string | null;
        };
        Update: {
          id?: number;
          contentid?: number;
          originimgurl?: string;
          imgname?: string;
          smallimageurl?: string | null;
          cpyrhtdivcd?: string | null;
          serialnum?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'landmark_image_contentid_fk';
            columns: ['contentid'];
            isOneToOne: false;
            referencedRelation: 'landmark';
            referencedColumns: ['contentid'];
          },
        ];
      };
      landmark_intro: {
        Row: {
          id: number;
          contentid: number;
          contenttypeid: number;
          heritage1: boolean | null;
          heritage2: boolean | null;
          heritage3: boolean | null;
          infocenter: string | null;
          opendate: string | null;
          restdate: string | null;
          expguide: string | null;
          expagerange: string | null;
          accomcount: string | null;
          useseason: string | null;
          usetime: string | null;
          parking: string | null;
          chkbabycarriage: boolean | null;
          chkpet: boolean | null;
          chkcreditcard: boolean | null;
        };
        Insert: {
          id?: number;
          contentid: number;
          contenttypeid: number;
          heritage1?: boolean | null;
          heritage2?: boolean | null;
          heritage3?: boolean | null;
          infocenter?: string | null;
          opendate?: string | null;
          restdate?: string | null;
          expguide?: string | null;
          expagerange?: string | null;
          accomcount?: string | null;
          useseason?: string | null;
          usetime?: string | null;
          parking?: string | null;
          chkbabycarriage?: boolean | null;
          chkpet?: boolean | null;
          chkcreditcard?: boolean | null;
        };
        Update: {
          id?: number;
          contentid?: number;
          contenttypeid?: number;
          heritage1?: boolean | null;
          heritage2?: boolean | null;
          heritage3?: boolean | null;
          infocenter?: string | null;
          opendate?: string | null;
          restdate?: string | null;
          expguide?: string | null;
          expagerange?: string | null;
          accomcount?: string | null;
          useseason?: string | null;
          usetime?: string | null;
          parking?: string | null;
          chkbabycarriage?: boolean | null;
          chkpet?: boolean | null;
          chkcreditcard?: boolean | null;
        };
        Relationships: [
          {
            foreignKeyName: 'landmark_intro_contentid_fk';
            columns: ['contentid'];
            isOneToOne: true;
            referencedRelation: 'landmark';
            referencedColumns: ['contentid'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
