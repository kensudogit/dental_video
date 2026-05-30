package demo

// VideoEmbedURLs maps demo video IDs to dental-education YouTube embeds.
var VideoEmbedURLs map[string]string

func init() {
	VideoEmbedURLs = make(map[string]string, len(CatalogVideos()))
	for _, v := range CatalogVideos() {
		VideoEmbedURLs[v.ID] = v.EmbedURL()
	}
}

func VideoURL(id string) string {
	if u, ok := VideoEmbedURLs[id]; ok {
		return u
	}
	return VideoEmbedURLs["v-1"]
}
