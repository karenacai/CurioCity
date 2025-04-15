export const categoryStyles: Record<string, { color: string, emoji: string }> = {
  "Pop Culture": { color: "#FF5733", emoji: "🎭" },
  "World Cuisine": { color: "#36A2EB", emoji: "🍲" },
  "Strange But True": { color: "#9966FF", emoji: "🤔" },
  "Legendary Creatures": { color: "#4BC0C0", emoji: "🐲" },
  "Internet History": { color: "#FF9F40", emoji: "🌐" },
  "Musical Mashups": { color: "#FF6384", emoji: "🎵" },
  "Movie Quotes": { color: "#FFCD56", emoji: "🎬" },
  "Hidden Talents of Celebrities": { color: "#C9CBCF", emoji: "🌟" },
  "Unusual Inventions": { color: "#7ED321", emoji: "💡" },
  "Global Festivals": { color: "#B10DC9", emoji: "🎉" },
  "Ancient Civilizations": { color: "#A0522D", emoji: "🏛️" },
  "Science in Everyday Life": { color: "#39CCCC", emoji: "🔬" },
  "Art Heists": { color: "#85144B", emoji: "🖼️" },
  "Memes & Viral Moments": { color: "#01FF70", emoji: "😂" },
  "Space Oddities": { color: "#001F3F", emoji: "🚀" },
  "Mythology Mix": { color: "#FF851B", emoji: "⚡" },
  "Famous Firsts": { color: "#3D9970", emoji: "🥇" },
  "Fictional Worlds": { color: "#F012BE", emoji: "🧙" },
  "Historical Underdogs": { color: "#FF4136", emoji: "🦸" },
  "Language Twists": { color: "#2ECC40", emoji: "💬" },
  "Tech Through Time": { color: "#0074D9", emoji: "⌚" },
  "Animal Kingdom Quirks": { color: "#FFDC00", emoji: "🦁" },
  "Sports Scandals": { color: "#FF0000", emoji: "🏆" },
  "Fashion Through the Ages": { color: "#F8A4D8", emoji: "👗" },
  "Board Games & Beyond": { color: "#8F8F8F", emoji: "🎲" }
};

// Export separate arrays for easier mapping
export const categoryEmojis: Record<string, string> = Object.fromEntries(
  Object.entries(categoryStyles).map(([category, { emoji }]) => [category, emoji])
);

export const categoryColors: Record<string, string> = Object.fromEntries(
  Object.entries(categoryStyles).map(([category, { color }]) => [category, color])
); 