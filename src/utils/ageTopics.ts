/**
 * Utility functions for age-specific topic management
 */

// Age group constants
export const AGE_GROUPS = {
  EARLY_CHILDHOOD: "2-3",
  PRESCHOOL: "4-6",
  PRIMARY_SCHOOL: "7-8",
  MIDDLE_SCHOOL: "9-10",
} as const;

// Topic keys for localization
export const getTopicKeys = (ageGroup: string): string[] => {
  switch (ageGroup) {
    case AGE_GROUPS.EARLY_CHILDHOOD:
      return [
        "animals",
        "colors",
        "momAndDad",
        "toys",
        "food",
        "sounds",
        "bodyParts",
        "clothes",
        "home",
        "sleep",
        // New interactive topics
        "emotions",
        "bigSmall",
        "shapes",
        "counting123",
        "dayNight",
        "cleanDirty",
        "softHard",
        "pets",
        "weather",
        "playground",
      ];
    case AGE_GROUPS.PRESCHOOL:
      return [
        "letters",
        "numbers",
        "shapes",
        "colors",
        "animals",
        "professions",
        "transport",
        "family",
        "friends",
        "holidays",
        // New interactive topics
        "seasons",
        "emotions",
        "patterns",
        "opposites",
        "sorting",
        "counting10",
        "natureSeasons",
        "safety",
        "manners",
        "hygiene",
      ];
    case AGE_GROUPS.PRIMARY_SCHOOL:
      return [
        "reading",
        "mathematics",
        "nature",
        "planets",
        "stories",
        "countries",
        "sports",
        "art",
        "music",
        "science",
      ];
    case AGE_GROUPS.MIDDLE_SCHOOL:
      return [
        "science",
        "history",
        "geography",
        "inventions",
        "ecology",
        "technology",
        "culture",
        "languages",
        "mathematics",
        "physics",
      ];
    default:
      return [
        "animals",
        "colors",
        "numbers",
        "letters",
        "shapes",
        "family",
        "food",
        "transport",
        "weather",
        "emotions",
      ];
  }
};

// Fallback function for non-localized usage
export const getPopularTopicsByAge = (ageGroup: string): string[] => {
  switch (ageGroup) {
    case AGE_GROUPS.EARLY_CHILDHOOD:
      return [
        "Тварини",
        "Кольори",
        "Мама і тато",
        "Іграшки",
        "Їжа",
        "Звуки",
        "Частини тіла",
        "Одяг",
        "Дім",
        "Сон",
        // New interactive topics
        "Емоції",
        "Великий-маленький",
        "Фігури",
        "Лічба 1-2-3",
        "День-ніч",
        "Чистий-брудний",
        "М'який-твердий",
        "Домашні улюбленці",
        "Погода",
        "Майданчик",
      ];
    case AGE_GROUPS.PRESCHOOL:
      return [
        "Літери",
        "Числа",
        "Фігури",
        "Кольори",
        "Тварини",
        "Професії",
        "Транспорт",
        "Сім'я",
        "Друзі",
        "Свята",
        // New interactive topics
        "Пори року",
        "Емоції",
        "Візерунки",
        "Протилежності",
        "Сортування",
        "Лічба до 10",
        "Природа",
        "Безпека",
        "Ввічливість",
        "Гігієна",
      ];
    case AGE_GROUPS.PRIMARY_SCHOOL:
      return [
        "Читання",
        "Математика",
        "Природа",
        "Планети",
        "Історії",
        "Країни",
        "Спорт",
        "Мистецтво",
        "Музика",
        "Наука",
      ];
    case AGE_GROUPS.MIDDLE_SCHOOL:
      return [
        "Наука",
        "Історія",
        "Географія",
        "Винаходи",
        "Екологія",
        "Технології",
        "Культура",
        "Мови",
        "Математика",
        "Фізика",
      ];
    default:
      return [
        "Тварини",
        "Кольори",
        "Числа",
        "Літери",
        "Фігури",
        "Сім'я",
        "Їжа",
        "Транспорт",
        "Погода",
        "Емоції",
      ];
  }
};

export const isTopicValidForAge = (
  topic: string,
  ageGroup: string,
): boolean => {
  const validTopics = getPopularTopicsByAge(ageGroup);
  return validTopics.includes(topic);
};

/**
 * Get topic suggestions with emojis for UI
 */
export interface TopicSuggestion {
  key: string;
  label: string;
  emoji: string;
  category: 'animals' | 'learning' | 'emotions' | 'activities' | 'family' | 'other';
}

export const getTopicSuggestionsWithEmoji = (ageGroup: string): TopicSuggestion[] => {
  switch (ageGroup) {
    case AGE_GROUPS.EARLY_CHILDHOOD: // 2-3 years
      return [
        { key: "animals", label: "Тварини", emoji: "🐱", category: "animals" },
        { key: "colors", label: "Кольори", emoji: "🎨", category: "learning" },
        { key: "toys", label: "Іграшки", emoji: "🧸", category: "activities" },
        { key: "food", label: "Їжа", emoji: "🍎", category: "other" },
        { key: "emotions", label: "Емоції", emoji: "😊", category: "emotions" },
        { key: "shapes", label: "Фігури", emoji: "⭕", category: "learning" },
        { key: "counting123", label: "Лічба 1-2-3", emoji: "1️⃣2️⃣3️⃣", category: "learning" },
        { key: "weather", label: "Погода", emoji: "🌞", category: "other" },
        { key: "momAndDad", label: "Мама і тато", emoji: "👪", category: "family" },
        { key: "pets", label: "Улюбленці", emoji: "🐶", category: "animals" },
        { key: "sounds", label: "Звуки", emoji: "🔊", category: "learning" },
        { key: "bigSmall", label: "Великий-маленький", emoji: "📏", category: "learning" },
      ];
    case AGE_GROUPS.PRESCHOOL: // 4-6 years
      return [
        { key: "letters", label: "Літери", emoji: "🔤", category: "learning" },
        { key: "numbers", label: "Числа", emoji: "🔢", category: "learning" },
        { key: "shapes", label: "Фігури", emoji: "🔷", category: "learning" },
        { key: "colors", label: "Кольори", emoji: "🌈", category: "learning" },
        { key: "animals", label: "Тварини", emoji: "🦁", category: "animals" },
        { key: "professions", label: "Професії", emoji: "👨‍⚕️", category: "learning" },
        { key: "transport", label: "Транспорт", emoji: "🚗", category: "other" },
        { key: "family", label: "Сім'я", emoji: "👨‍👩‍👧", category: "family" },
        { key: "emotions", label: "Емоції", emoji: "🎭", category: "emotions" },
        { key: "seasons", label: "Пори року", emoji: "🌸", category: "learning" },
        { key: "patterns", label: "Візерунки", emoji: "🔁", category: "learning" },
        { key: "counting10", label: "Лічба до 10", emoji: "🔟", category: "learning" },
      ];
    default:
      return [];
  }
};

