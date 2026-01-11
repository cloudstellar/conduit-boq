/**
 * Utility functions for parsing and formatting construction areas
 * Handles various formats of exchange names (ชุมสาย) and province names (จังหวัด)
 */

export interface ParsedConstructionArea {
  exchange: string | null;      // Normalized exchange name (e.g., "ชส.ABC")
  province: string | null;       // Normalized province name (e.g., "จ.กรุงเทพ")
  original: string;              // Original input string
  parsed: boolean;               // Whether parsing was successful
}

/**
 * Normalize exchange name to standard format "ชส.XXX"
 * Handles: "ชุมสาย ABC", "ชส. ABC", "ชุมสายโทรศัพท์ABC", etc.
 */
export function normalizeExchangeName(text: string): string | null {
  if (!text) return null;

  // Remove extra spaces
  const cleaned = text.trim().replace(/\s+/g, ' ');

  // Patterns to match exchange names
  const patterns = [
    /ชุมสายโทรศัพท์\s*([^\s,]+)/i,
    /ชุมสาย\s*([^\s,]+)/i,
    /ชส\.\s*([^\s,]+)/i,
    /ชส\s+([^\s,]+)/i,
  ];

  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    if (match && match[1]) {
      return `ชส.${match[1].trim()}`;
    }
  }

  return null;
}

/**
 * Normalize province name to standard format "จ.XXX"
 * Handles: "จังหวัดกรุงเทพ", "จ.กรุงเทพ", "จ กรุงเทพ", etc.
 */
export function normalizeProvinceName(text: string): string | null {
  if (!text) return null;

  // Remove extra spaces
  const cleaned = text.trim().replace(/\s+/g, ' ');

  // Patterns to match province names
  const patterns = [
    /จังหวัด\s*([^\s,]+)/i,
    /จ\.\s*([^\s,]+)/i,
    /จ\s+([^\s,]+)/i,
  ];

  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    if (match && match[1]) {
      return `จ.${match[1].trim()}`;
    }
  }

  return null;
}

/**
 * Parse construction area string to extract exchange and province
 */
export function parseConstructionArea(area: string): ParsedConstructionArea {
  if (!area || !area.trim()) {
    return {
      exchange: null,
      province: null,
      original: area || '',
      parsed: false,
    };
  }

  const exchange = normalizeExchangeName(area);
  const province = normalizeProvinceName(area);

  return {
    exchange,
    province,
    original: area.trim(),
    parsed: !!(exchange || province),
  };
}

/**
 * Format multiple construction areas with smart grouping by province
 * Groups exchanges by province and formats as: "ชส.A, ชส.B จ.X, ชส.C จ.Y"
 */
export function formatConstructionAreas(areas: (string | null)[]): string {
  if (!areas || areas.length === 0) return '-';

  // Filter out null/empty values
  const validAreas = areas.filter((a): a is string => !!a && a.trim() !== '');
  if (validAreas.length === 0) return '-';

  // Parse all areas
  const parsed = validAreas.map(parseConstructionArea);

  // Remove duplicates based on original text (case-insensitive)
  const uniqueParsed = parsed.filter((item, index, self) => 
    index === self.findIndex(t => 
      t.original.toLowerCase() === item.original.toLowerCase()
    )
  );

  // Group by province
  const grouped = new Map<string, ParsedConstructionArea[]>();
  const unparsed: ParsedConstructionArea[] = [];

  uniqueParsed.forEach(item => {
    if (item.parsed && item.province) {
      const key = item.province;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(item);
    } else if (item.parsed && item.exchange && !item.province) {
      // Exchange without province - group under empty province
      const key = '';
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(item);
    } else {
      // Could not parse - keep original
      unparsed.push(item);
    }
  });

  // Sort provinces alphabetically
  const sortedProvinces = Array.from(grouped.keys()).sort((a, b) => {
    if (a === '') return -1; // Empty province (no province) comes first
    if (b === '') return 1;
    return a.localeCompare(b, 'th');
  });

  // Build output
  const parts: string[] = [];

  sortedProvinces.forEach(province => {
    const items = grouped.get(province)!;
    
    // Sort exchanges within province
    items.sort((a, b) => {
      const aEx = a.exchange || a.original;
      const bEx = b.exchange || b.original;
      return aEx.localeCompare(bEx, 'th');
    });

    // Format exchanges for this province
    const exchanges = items.map(item => item.exchange || item.original);
    
    if (province === '') {
      // No province - just list exchanges
      parts.push(exchanges.join(', '));
    } else {
      // With province - format as "ชส.A, ชส.B จ.X"
      parts.push(`${exchanges.join(', ')} ${province}`);
    }
  });

  // Add unparsed items at the end
  unparsed.forEach(item => {
    parts.push(item.original);
  });

  return parts.join(', ');
}

