import { categorize, KATEGORI_LIST } from './kategori.service';

describe('categorize — rule-based keyword tagger', () => {
  // Text kosong / null → []
  it('returns [] for null input', () => {
    expect(categorize(null)).toEqual([]);
  });

  it('returns [] for undefined input', () => {
    expect(categorize(undefined)).toEqual([]);
  });

  it('returns [] for empty string', () => {
    expect(categorize('')).toEqual([]);
  });

  it('returns [] for whitespace-only string', () => {
    expect(categorize('   ')).toEqual([]);
  });

  // Kategori tunggal
  describe('single category', () => {
    it('detects RASA', () => {
      expect(categorize('nasinya hambar banget')).toEqual(['RASA']);
    });

    it('detects PORSI', () => {
      expect(categorize('porsinya sedikit')).toEqual(['PORSI']);
    });

    it('detects KUALITAS', () => {
      expect(categorize('nasinya basi')).toEqual(['KUALITAS']);
    });

    it('detects KEBERSIHAN', () => {
      expect(categorize('ada rambut di makanan')).toEqual(['KEBERSIHAN']);
    });

    it('detects DISTRIBUSI', () => {
      expect(categorize('makanan terlambat datang')).toEqual(['DISTRIBUSI']);
    });
  });

  // Multi-label
  describe('multi-label', () => {
    it('detects KUALITAS + PORSI', () => {
      const result = categorize('nasinya basi dan porsinya sedikit');
      expect(result).toContain('KUALITAS');
      expect(result).toContain('PORSI');
      expect(result).toHaveLength(2);
    });

    it('detects RASA + KUALITAS + DISTRIBUSI', () => {
      const result = categorize('rasanya hambar, makanan dingin, dan datang terlambat');
      expect(result).toContain('RASA');
      expect(result).toContain('KUALITAS');
      expect(result).toContain('DISTRIBUSI');
      expect(result).toHaveLength(3);
    });
  });

  // Fallback LAINNYA
  describe('LAINNYA fallback', () => {
    it('returns LAINNYA when no keyword matches', () => {
      expect(categorize('terima kasih sudah menyediakan makanan')).toEqual(['LAINNYA']);
    });

    it('returns LAINNYA for unrelated feedback', () => {
      expect(categorize('hari ini saya senang datang ke sekolah')).toEqual(['LAINNYA']);
    });
  });

  // Case insensitive
  it('is case insensitive', () => {
    expect(categorize('NASINYA HAMBAR BANGET')).toEqual(['RASA']);
  });

  // Multi-word keywords
  it('matches multi-word keywords like "belum matang"', () => {
    expect(categorize('sayurnya belum matang')).toContain('KUALITAS');
  });

  it('matches multi-word keywords like "jam istirahat"', () => {
    expect(categorize('sampai lewat jam istirahat')).toContain('DISTRIBUSI');
  });

  // Smoke test dari spec: "nasinya basi dan porsinya sedikit" → ['KUALITAS','PORSI']
  it('smoke test: "nasinya basi dan porsinya sedikit" → KUALITAS + PORSI', () => {
    const result = categorize('nasinya basi dan porsinya sedikit');
    expect(result.sort()).toEqual(['KUALITAS', 'PORSI'].sort());
  });
});
