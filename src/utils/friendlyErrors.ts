type Language = "ua" | "en" | string;

const isEnglishLanguage = (language: Language) => language.toLowerCase().startsWith("en");

const messageFromError = (error: unknown) =>
  error instanceof Error ? error.message : typeof error === "string" ? error : "";

export function getFriendlyProfileError(error: unknown, language: Language, fallback: string) {
  const message = messageFromError(error).toLowerCase();
  const isEnglish = isEnglishLanguage(language);

  if (!message) return fallback;

  if (/document upload failed|unsupported.*(file|extension)|invalid.*(file|extension)/.test(message)) {
    if (/valid image|not an image|corrupted image/.test(message)) {
      return isEnglish
        ? "The server currently accepts only JPG or PNG images in this field. PDF support must be fixed on the backend."
        : "Сервер зараз приймає в цьому полі лише зображення JPG або PNG. Підтримку PDF потрібно виправити на backend.";
    }

    if (/too large|file size|maximum size|max.*size/.test(message)) {
      return isEnglish
        ? "The document is too large. Choose a smaller PDF, JPG or PNG file."
        : "Документ завеликий. Оберіть менший файл у форматі PDF, JPG або PNG.";
    }

    return isEnglish
      ? "The document could not be uploaded. Use a valid PDF, JPG or PNG file."
      : "Не вдалося завантажити документ. Оберіть коректний файл у форматі PDF, JPG або PNG.";
  }

  if (/phone|telephone|phone_number|format|valid phone|phonenumber/.test(message)) {
    return isEnglish
      ? "The phone number has an invalid format. Check the country code and number."
      : "Телефон має неправильний формат. Перевірте код країни та номер.";
  }

  if (/already|exists|unique|email/.test(message)) {
    return isEnglish
      ? "A user with this email or profile data already exists."
      : "Користувач із таким email або профілем уже існує.";
  }

  if (/birth|date_of_birth|birth_date|birthday|dob/.test(message)) {
    return isEnglish
      ? "Check the birth date format."
      : "Перевірте формат дати народження.";
  }

  if (/required|blank|null|empty/.test(message)) {
    return isEnglish
      ? "Fill in the required fields."
      : "Заповніть обов'язкові поля.";
  }

  if (/permission|forbidden|403|unauthorized|401|authentication/.test(message)) {
    return isEnglish
      ? "Log in again and check that this profile belongs to your account."
      : "Увійдіть ще раз і перевірте, що цей профіль належить вашому акаунту.";
  }

  if (/education_other|educationother/.test(message)) {
    return isEnglish
      ? "The server requires an additional education field. Try saving again."
      : "Сервер вимагає додаткове поле освіти. Спробуйте зберегти ще раз.";
  }

  return fallback;
}
