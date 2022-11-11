/* eslint-disable @typescript-eslint/no-var-requires */
import { SettingsProp, ContentProp, DataProp } from "./../types/index";
import { MarkdownView, Notice, request } from "obsidian";
import { sign } from "jsonwebtoken";

const matter = require("gray-matter");
const MarkdownIt = require("markdown-it");

const md = new MarkdownIt();
const version = "v4";

const contentPost = (frontmatter: ContentProp, data: DataProp) => ({
	posts: [
		{
			...frontmatter,
			html: md.render(data.content),
		},
	],
});

export const publishPost = async (
	view: MarkdownView,
	settings: SettingsProp
) => {
	// Ghost Url and Admin API key
	const key = settings.adminToken;
	const [id, secret] = key.split(":");

	// Create the token (including decoding secret)
	const token = sign({}, Buffer.from(secret, "hex"), {
		keyid: id,
		algorithm: "HS256",
		expiresIn: "5m",
		audience: `/${version}/admin/`,
	});

	// get frontmatter
	const noteFile = app.workspace.getActiveFile();
	const metaMatter = app.metadataCache.getFileCache(noteFile).frontmatter;
	const data = matter(view.getViewData());

	const frontmatter = {
		title: metaMatter?.title || view.file.basename,
		tags: metaMatter?.tags || [],
		featured: metaMatter?.featured || false,
		status: metaMatter?.published ? "published" : "draft",
		excerpt: metaMatter?.excerpt || undefined,
		feature_image: metaMatter?.feature_image || undefined,        
	};

	const result = await request({
		url: `${settings.url}/ghost/api/${version}/admin/posts/?source=html`,
		method: "POST",
		contentType: "application/json",
		headers: {
			"Access-Control-Allow-Methods": "POST",
			"Content-Type": "application/json;charset=utf-8",
			Authorization: `Ghost ${token}`,
		},
		body: JSON.stringify(contentPost(frontmatter, data)),
	});

	const json = JSON.parse(result);

	if (json?.posts) {
		new Notice(
			`"${json?.posts?.[0]?.title}" (${json?.posts?.[0]?.status}) was uploaded to Lawyers Media`
		);
	} else {
		new Notice(`${json.errors[0].context || json.errors[0].message}`);
		new Notice(
			`${json.errors[0]?.details[0].message} - ${json.errors[0]?.details[0].params.allowedValues}`
		);
	}

	return json;
};
