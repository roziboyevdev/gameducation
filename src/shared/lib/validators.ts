const NAME_PATTERN = /^[a-zA-ZА-Яа-яЎўҚқҒғҲҳ\s'-]+$/u;

export function validatePlayerName(name: string, playerNum?: 1 | 2): string | null {
  const label = playerNum ? `${playerNum}-o'yinchi ismini kiriting!` : "Ismingizni kiriting!";
  const trimmed = name.trim();
  if (!trimmed) return label;
  if (trimmed.length < 2) return "Ism kamida 2 harf bo'lishi kerak!";
  if (!NAME_PATTERN.test(trimmed)) return 'Faqat harflardan foydalaning!';
  return null;
}
