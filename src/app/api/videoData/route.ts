import { NextResponse } from "next/server";
import fetch from "node-fetch"; // Node.js 17.5 ve altı sürümler için
import xml2js from "xml2js";

export async function POST() {
  // URL'den XML verisini çek
  const response = await fetch("https://muse.ai/collections/WQdRkN7/mrss");
  if (!response.ok) {
    throw new Error(`Error: ${response.statusText}`);
  }
  const xml = await response.text();

  // xml2js parser'ını oluşturun
  const parser = new xml2js.Parser();
  const urls: string[] = [];
  // XML'i JavaScript objesine dönüştür ve işle
  parser.parseString(xml, (err: any, result: any) => {
    if (err) {
      throw err;
    }

    const items = result.rss.channel[0].item;
    items.forEach((item: any) => {
      if (item["media:content"]) {
        urls.push(item["media:content"][0].$.url);
      }
    });
  });
  return new Response(JSON.stringify({ urls: urls }));
}
