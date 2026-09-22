import { Channel } from '../models/types';

export class M3uParser {
  public static parse(content: string, playlistId: string): Channel[] {
    const lines = content.split(/\r?\n/);
    const channels: Channel[] = [];

    let currentTvgName = '';
    let currentTvgLogo = '';
    let currentGroupTitle = 'Uncategorized';
    let currentCountry = '';
    let currentLanguage = '';
    let currentChno: number | undefined = undefined;
    let currentDisplayName = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      if (line.startsWith('#EXTINF:')) {
        currentTvgName = this.extractAttribute(line, 'tvg-name') || '';
        currentTvgLogo = this.extractAttribute(line, 'tvg-logo') || '';
        currentGroupTitle = this.extractAttribute(line, 'group-title') || 'Uncategorized';
        currentCountry = this.extractAttribute(line, 'tvg-country') || '';
        currentLanguage = this.extractAttribute(line, 'tvg-language') || '';

        const chnoStr = this.extractAttribute(line, 'tvg-chno');
        currentChno = chnoStr ? parseInt(chnoStr, 10) : undefined;

        const commaIndex = line.lastIndexOf(',');
        if (commaIndex !== -1 && commaIndex < line.length - 1) {
          currentDisplayName = line.substring(commaIndex + 1).trim();
        } else {
          currentDisplayName = currentTvgName || 'Unknown Channel';
        }
      } else if (!line.startsWith('#')) {
        const streamUrl = line.trim();
        if (streamUrl.startsWith('http://') || streamUrl.startsWith('https://') || streamUrl.startsWith('rtmp://') || streamUrl.startsWith('rtsp://') || streamUrl.startsWith('blob:')) {
          const finalName = currentDisplayName || currentTvgName || `Channel ${channels.length + 1}`;
          const channelId = `ch_${playlistId}_${channels.length + 1}_${Math.abs(this.hashCode(streamUrl))}`;

          channels.push({
            id: channelId,
            name: finalName,
            url: streamUrl,
            logo: currentTvgLogo || undefined,
            group: currentGroupTitle || 'General',
            country: currentCountry || undefined,
            language: currentLanguage || undefined,
            channelNo: currentChno || channels.length + 1,
            isFavorite: false,
            playlistId
          });
        }

        currentTvgName = '';
        currentTvgLogo = '';
        currentGroupTitle = 'Uncategorized';
        currentCountry = '';
        currentLanguage = '';
        currentChno = undefined;
        currentDisplayName = '';
      }
    }

    return channels;
  }

  private static extractAttribute(line: string, attrName: string): string | null {
    const regex = new RegExp(`${attrName}="([^"]*)"`, 'i');
    const match = line.match(regex);
    if (match && match[1]) {
      return match[1].trim();
    }
    const regexNoQuotes = new RegExp(`${attrName}=([^\\s,]+)`, 'i');
    const matchNoQuotes = line.match(regexNoQuotes);
    return matchNoQuotes && matchNoQuotes[1] ? matchNoQuotes[1].trim() : null;
  }

  private static hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }
}