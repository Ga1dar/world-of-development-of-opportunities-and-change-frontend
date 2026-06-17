import { useEffect, useState } from "react";

const countries = [
  {
    code: "+380",
    ua: "Україна",
    en: "Ukraine",
  },
  {
    code: "+48",
    ua: "Польща",
    en: "Poland",
  },
  {
    code: "+49",
    ua: "Німеччина",
    en: "Germany",
  },
  {
    code: "+420",
    ua: "Чехія",
    en: "Czechia",
  },
  {
    code: "+1",
    ua: "США",
    en: "United States",
  },
];

type PhoneCountryFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  language: string;
  required?: boolean;
};

const isEnglishLanguage = (language: string) => language.toLowerCase().startsWith("en");

const getCurrentCountryCode = (value: string) => {
  const normalizedValue = value.trim();

  return (
    [...countries]
      .sort((a, b) => b.code.length - a.code.length)
      .find((country) => normalizedValue.startsWith(country.code))?.code || countries[0].code
  );
};

const digitsOnly = (value: string) => value.replace(/\D/g, "");

const stripDomesticPrefix = (value: string, code: string) => {
  const digits = digitsOnly(value);

  if (code === "+380" || code === "+49") {
    return digits.replace(/^0+/, "");
  }

  return digits;
};

const getNationalNumber = (value: string, code = getCurrentCountryCode(value)) => {
  const trimmedValue = value.trim();

  if (!trimmedValue) return "";
  if (trimmedValue.startsWith(code)) {
    return stripDomesticPrefix(trimmedValue.slice(code.length), code);
  }

  if (trimmedValue.startsWith("+")) {
    const pastedCode = getCurrentCountryCode(trimmedValue);
    return stripDomesticPrefix(trimmedValue.slice(pastedCode.length), pastedCode);
  }

  return stripDomesticPrefix(trimmedValue, code);
};

const replaceCountryCode = (value: string, code: string) => {
  const nationalNumber = getNationalNumber(value, code);

  return nationalNumber ? `${code}${nationalNumber}` : "";
};

const formatPhoneValue = (inputValue: string, fallbackCode: string) => {
  const trimmedValue = inputValue.trim();
  if (!trimmedValue) return "";

  if (trimmedValue.startsWith("+")) {
    const pastedCode = getCurrentCountryCode(trimmedValue);
    const nationalNumber = getNationalNumber(trimmedValue, pastedCode);

    return nationalNumber ? `${pastedCode}${nationalNumber}` : "";
  }

  const nationalNumber = stripDomesticPrefix(trimmedValue, fallbackCode);
  return nationalNumber ? `${fallbackCode}${nationalNumber}` : "";
};

export function PhoneCountryField({
  label,
  placeholder,
  value,
  onChange,
  language,
  required = false,
}: PhoneCountryFieldProps) {
  const isEnglish = isEnglishLanguage(language);
  const [selectedCode, setSelectedCode] = useState(() => getCurrentCountryCode(value));
  const currentCode = value.trim() ? getCurrentCountryCode(value) : selectedCode;
  const nationalNumber = getNationalNumber(value, currentCode);
  const commitPhoneValue = () => {
    const normalizedValue = formatPhoneValue(nationalNumber, currentCode);
    if (normalizedValue && normalizedValue !== value) {
      onChange(normalizedValue);
    }
  };

  useEffect(() => {
    if (value.trim()) {
      setSelectedCode(getCurrentCountryCode(value));
    }
  }, [value]);

  return (
    <label className="block font-montserrat text-[#1C100E]">
      <span className="mb-1 block text-[12px] leading-[1.2] min-[744px]:text-[13px]">{label}</span>
      <div className="flex h-[34px] w-full overflow-hidden rounded-[18px] border border-[#40213F] bg-[#F0E8F0] transition focus-within:ring-2 focus-within:ring-[#B34D8D]/30 min-[744px]:h-[37px] min-[1420px]:h-[34px]">
        <select
          value={currentCode}
          onChange={(event) => {
            const nextCode = event.target.value;
            setSelectedCode(nextCode);
            onChange(replaceCountryCode(value, nextCode));
          }}
          className="h-full max-w-[126px] shrink-0 border-r border-[#40213F]/45 bg-[#F0E8F0] px-2 font-montserrat text-[11px] text-[#1C100E] outline-none min-[744px]:max-w-[138px]"
          aria-label={isEnglish ? "Country code" : "Код країни"}
        >
          {countries.map((country) => (
            <option key={country.code} value={country.code}>
              {country.code} {isEnglish ? country.en : country.ua}
            </option>
          ))}
        </select>
        <input
          value={nationalNumber}
          onChange={(event) => {
            onChange(formatPhoneValue(event.target.value, currentCode));
          }}
          onBlur={commitPhoneValue}
          required={required}
          placeholder={placeholder}
          className="h-full min-w-0 flex-1 bg-transparent px-3 font-montserrat text-[12px] text-[#1C100E] outline-none placeholder:text-[#1C100E]/45"
        />
      </div>
    </label>
  );
}
