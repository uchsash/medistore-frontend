"use client";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { env } from "@/env";

export function HeroSearch() {
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const frontend_url = env.NEXT_PUBLIC_FRONTEND_URL;
  
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch(`${frontend_url}/api/categories`);
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    }
    fetchCategories();
  }, []);

  return (
    <section className="bg-[#76c893] text-white pt-16 pb-24 px-4 text-center">
      <h1 className="text-4xl font-bold mb-4">Medicine at Your Door, Free Delivery Every Time</h1>
      <p className="text-lg opacity-90 mb-10">Explore a vast array of high-quality pharmaceuticals, supplements, and healthcare products.</p>

      {/* Search Bar Container */}
      <div className="max-w-4xl mx-auto flex items-center bg-white rounded-full p-1 shadow-lg">
        <div className="flex-1 flex items-center px-4">
          <Input 
            className="border-none focus-visible:ring-0 text-black placeholder:text-gray-400"
            placeholder="Search medicine, medical products"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="h-8 w-[1px] bg-gray-200" />

        <Select>
          <SelectTrigger className="w-[180px] border-none focus:ring-0 text-gray-600">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button size="icon" className="bg-[#2d6a4f] hover:bg-[#1b4332] rounded-full h-10 w-12 ml-2">
          <Search className="h-5 w-5" />
        </Button>
      </div>

      {/* Popular Search Tags */}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <span className="text-sm opacity-80">Popular Search:</span>
        {["Glucometer", "Pulse Oximeter", "Blood Pressure Cuff", "Thermometer"].map((item) => (
          <button key={item} className="bg-white/20 hover:bg-white/30 px-4 py-1 rounded-md text-sm transition">
            {item}
          </button>
        ))}
      </div>
    </section>
  );
}