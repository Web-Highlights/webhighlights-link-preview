import { Handler } from "@netlify/functions";
import fetch from "cross-fetch";
import ogs from "open-graph-scraper";

export interface OpenGraphMetaData {
  title?: string;
  image?: OpenGraphImage;
  description?: string;
  url?: string;
  type?: string;
  author?: string;
  favicon?: string;
}
export type LinkMetaData = OpenGraphMetaData;

import { OpenGraphImage, SuccessResult } from "open-graph-scraper";

type OpenGraphSuccessResult = Partial<SuccessResult["result"]> & {
  favicon?: string;
};

export function mapOpenGraphResultToMetaData(
  result: OpenGraphSuccessResult
): LinkMetaData {
  return {
    title: result.ogTitle,
    type: result.ogType,
    description: result.ogDescription,
    author: result.author,
    url: result.ogUrl,
    image: mapImage(result),
    favicon: result.favicon,
  };
}

function mapImage(result: OpenGraphSuccessResult): LinkMetaData["image"] {
  let image = result.ogImage;
  if (!image) return undefined;

  if (Array.isArray(image)) {
    image = image[0];
  }

  const imageIsOpenGraphImage = (image: any): image is OpenGraphImage => {
    return (
      typeof image === "object" &&
      ["url", "type", "height", "width"].every((key) =>
        (image as object).hasOwnProperty(key)
      )
    );
  };

  if (imageIsOpenGraphImage(image)) {
    return image;
  }

  return {
    url: typeof image === "string" ? image : "",
    type: "",
    height: "",
    width: "",
  };
}

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET",
};

async function fetchJson<T>(url: string) {
  const data = await fetch(url);
  return data.json() as unknown as T;
}

export function validateParams({ url }: QueryParams) {
  if (!url) {
    throw new Error("url param is missing");
  }
}

interface QueryParams {
  url: string;
}

const handler: Handler = async (event, context) => {
  try {
    const params = event.queryStringParameters as unknown as QueryParams;
    validateParams(params);
    const { error, result } = await ogs({ url: params.url });
    if (error || !result?.success) {
      return {
        statusCode: 500,
        body: JSON.stringify(error),
        headers,
      };
    }
    const metaData: LinkMetaData = mapOpenGraphResultToMetaData(result);
    return {
      statusCode: 200,
      body: JSON.stringify(metaData),
      headers,
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify(error),
      headers,
    };
  }
};

export { handler };
