-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.landmark (
  contentid bigint NOT NULL,
  contenttypeid integer,
  title text NOT NULL,
  addr1 text,
  addr2 text,
  zipcode character varying,
  tel text,
  areacode integer,
  sigungucode integer,
  cat1 character varying,
  cat2 character varying,
  cat3 character varying,
  mapx double precision,
  mapy double precision,
  mlevel integer,
  firstimage text,
  firstimage2 text,
  cpyrhtdivcd character varying,
  createdtime timestamp without time zone,
  modifiedtime timestamp without time zone,
  ldongregncd integer,
  ldongsigngucd integer,
  lclssystm1 character varying,
  lclssystm2 character varying,
  lclssystm3 character varying,
  CONSTRAINT landmark_pkey PRIMARY KEY (contentid)
);