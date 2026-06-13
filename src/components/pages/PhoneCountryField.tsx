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

const replaceCountryCode = (value: string, code: string) => {
  const trimmedValue = value.trim();
  const currentCode = getCurrentCountryCode(trimmedValue);

  if (!trimmedValue) return code;
  if (trimmedValue.startsWith(currentCode)) {
    const rest = trimmedValue.slice(currentCode.length).trimStart();
    return rest ? `${code} ${rest}` : code;
  }

  return `${code} ${trimmedValue.replace(/^\+?\d{1,4}\s*/, "")}`.trim();
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
  const currentCode = getCurrentCountryCode(value);

  return (
    <label className="block font-montserrat text-[#1C100E]">
      <span className="mb-1 block text-[12px] leading-[1.2] min-[744px]:text-[13px]">{label}</span>
      <div className="flex h-[34px] w-full overflow-hidden rounded-[18px] border border-[#40213F] bg-[#F0E8F0] transition focus-within:ring-2 focus-within:ring-[#B34D8D]/30 min-[744px]:h-[37px] min-[1420px]:h-[34px]">
        <select
          value={currentCode}
          onChange={(event) => onChange(replaceCountryCode(value, event.target.value))}
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
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required={required}
          placeholder={placeholder}
          className="h-full min-w-0 flex-1 bg-transparent px-3 font-montserrat text-[12px] text-[#1C100E] outline-none placeholder:text-[#1C100E]/45"
        />
      </div>
    </label>
  );
}
