"use client";
import { useEffect } from "react";
import { sendEvent } from "@/components/layout/AnalyticsPageView";
export function ProductViewTracker({productId,slug}:{productId:string;slug:string}){useEffect(()=>{sendEvent("product_view",{productId,slug});},[productId,slug]);return null;}
