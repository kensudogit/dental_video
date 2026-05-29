package textutil

import (
	"strconv"
	"strings"
)

// DecodeJSONUnicodeEscapes converts literal \uXXXX sequences into UTF-8 runes.
// Some early SQL seeds stored escapes as plain text instead of Unicode.
func DecodeJSONUnicodeEscapes(s string) string {
	if !strings.Contains(s, `\u`) {
		return s
	}
	var b strings.Builder
	b.Grow(len(s))
	for i := 0; i < len(s); i++ {
		if i+6 <= len(s) && s[i] == '\\' && s[i+1] == 'u' {
			if code, err := strconv.ParseInt(s[i+2:i+6], 16, 32); err == nil {
				b.WriteRune(rune(code))
				i += 5
				continue
			}
		}
		b.WriteByte(s[i])
	}
	return b.String()
}
