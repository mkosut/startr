import { CastingFunction, parse } from 'csv-parse';
import * as fs from 'fs';
import * as path from 'path';
import dashify from 'dashify';
import { stringify } from 'yaml';

// TODO: 
// * Categories as directories
// * Posted date
// * Template

interface Link {
	title: string;
	link_url: string;
	contributor?: string;
	author: string;
	date?: Date;
	tags: string[];
	categories: string[];
	description: string;
	banner: "https://picsum.photos/600/500";
}

const transformLinkValues = (link: Link): Link => {
	return {
		...link,
		tags: link.tags.filter((tag) => tag.trim().length > 0)
	}
}

const linkTemplate = (link: Link): string => {
	return `---
${stringify(transformLinkValues(link))}
---

# Hello!
`
}

(() => {
	const csvFilePath = path.resolve("input.csv");
	const fileContent = fs.readFileSync(csvFilePath, { encoding: "utf8" })
	var recordCount = 0;

	const columns = ["title", "link_url", "type", "author", "publication", "institution", "levels", "category", "tags", "tags", "notes"]

	const parser = parse(fileContent, { columns: columns, trim: true, group_columns_by_name: true, from: 2 })


	parser.on('readable', async () => {
		let record: Link;
		while ((record = parser.read()) !== null) {
			const outFileName = dashify(record.title, { condense: true }).slice(0, 21) + ".md";
			const outFilePath = path.resolve('content', 'links', outFileName);
			const linkContent = linkTemplate(record);
			fs.writeFileSync(outFilePath, linkContent);
			recordCount += 1;
		};
	});

	parser.on('error', (err) => {
		console.error(err);
	});

	parser.on('end', () => {
		console.log(`Imported ${recordCount} links.`)
	})
})()