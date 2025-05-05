// scripts/fetchWarCounts.js
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const GUILD_NAME = 'Living in a society cats cute';
const API_BASE = 'https://api.wynncraft.com/v3/guild/';

async function getGuildData() {
  const url = `${API_BASE}${encodeURIComponent(GUILD_NAME)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch guild data: ${res.status}`);
  return res.json();
}

async function getWarCount(playerName) {
  const url = `https://api.wynncraft.com/v3/player/${encodeURIComponent(playerName)}`;
  const res = await fetch(url);
  if (!res.ok) return { name: playerName, wars: 0 };
  const data = await res.json();
  const warCount = data?.data?.global?.wars ?? 0;
  return { name: playerName, wars: warCount };
}

async function main() {
  const guildData = await getGuildData();
  const members = guildData?.members || [];

  const warData = [];

  for (const member of members) {
    const warInfo = await getWarCount(member.name);
    warData.push(warInfo);
    console.log(`Fetched ${warInfo.name}: ${warInfo.wars} wars`);
  }

  warData.sort((a, b) => b.wars - a.wars);

  // Save JSON
  fs.writeFileSync('war_counts.json', JSON.stringify(warData, null, 2));

  // Save Markdown
  const markdown = ['# War Count Leaderboard', '', '| Player | War Count |', '|--------|------------|']
    .concat(warData.map(({ name, wars }) => `| ${name} | ${wars} |`))
    .join('\n');

  fs.writeFileSync('WAR_COUNTS.md', markdown);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
