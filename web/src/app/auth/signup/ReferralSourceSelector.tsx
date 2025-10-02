"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/admin/connectors/Field";

interface ReferralSourceSelectorProps {
  defaultValue?: string;
}

const ReferralSourceSelector: React.FC<ReferralSourceSelectorProps> = ({
  defaultValue,
}) => {
  const [referralSource, setReferralSource] = useState(defaultValue);

  const referralOptions = [
    { value: "search", label: "Search Engine (Google/Bing)" },
    { value: "friend", label: "Friend/Colleague" },
    { value: "linkedin", label: "LinkedIn" },
    { value: "twitter", label: "Twitter" },
    { value: "hackernews", label: "HackerNews" },
    { value: "reddit", label: "Reddit" },
    { value: "youtube", label: "YouTube" },
    { value: "podcast", label: "Podcast" },
    { value: "blog", label: "Article/Blog" },
    { value: "ads", label: "Advertisements" },
    { value: "other", label: "Other" },
  ];

  const handleChange = (value: string) => {
    setReferralSource(value);
    const cookies = require("js-cookie");
    cookies.set("referral_source", value, {
      expires: 365,
      path: "/",
      sameSite: "strict",
    });
  };

  return (
    <div className="w-full max-w-sm gap-y-2 flex flex-col mx-auto">
      <Label className="text-gray-900 dark:text-gray-900" small={false}>
        How did you hear about us?
      </Label>
      <Select value={referralSource} onValueChange={handleChange}>
        <SelectTrigger
          id="referral-source"
          className="w-full rounded-full shadow-md hover:shadow-xl focus:ring-0 focus:ring-offset-0"
          style={{ backgroundColor: 'white !important', borderColor: '#d4d4d4 !important', color: '#0a0a0a !important' }}
        >
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent 
          className="max-h-60 shadow-md hover:shadow-xl overflow-y-auto rounded-2xl"
          style={{ backgroundColor: 'white !important', borderColor: '#d4d4d4 !important', color: '#0a0a0a !important' }}
        >
          {referralOptions.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="py-3 px-4 hover:rounded-full cursor-pointer"
              style={{ color: '#0a0a0a !important' }}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ReferralSourceSelector;
