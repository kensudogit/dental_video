package demo

// VideoEmbedURLs maps demo video IDs to dental-education YouTube embeds.
var VideoEmbedURLs = map[string]string{
	"v-1": "https://www.youtube.com/embed/JLeiDmOVfcg", // AAE: Root Canal Treatment Step by Step
	"v-2": "https://www.youtube.com/embed/qCBDpi7cQz4", // Root canal & crown procedure
	"v-3": "https://www.youtube.com/embed/LSJto5PVCoY", // Scaling & root planing
	"v-4": "https://www.youtube.com/embed/g-i3P-D6p7M", // Dental implant procedure (animation)
	"v-5": "https://www.youtube.com/embed/8gVfdyASewA", // Single dental implant (animation)
	"v-6": "https://www.youtube.com/embed/CO-CTNmpLc8", // Sterilize dental instruments
	"v-7": "https://www.youtube.com/embed/pJFIp5ZMID4", // SRP vs scaling (patient education)
	"v-8": "https://www.youtube.com/embed/oVSss3AgCt4", // Periodontal scaling animation
}

func VideoURL(id string) string {
	if u, ok := VideoEmbedURLs[id]; ok {
		return u
	}
	return VideoEmbedURLs["v-1"]
}
