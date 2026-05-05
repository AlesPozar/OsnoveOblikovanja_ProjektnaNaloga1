export interface Skin {
  id: string;
  name: string; // full name e.g. "AK-47 | Fire Serpent (Factory New)"
  skinName: string; // e.g. "Fire Serpent"
  rarity: string;
  weapon: string;
  hue: number; // 0-1 normalized
  saturation: number; // 0-1 normalized
  value: number; // raw value from data (0-255)
}

function parseRawData(raw: string): Skin[] {
  const lines = raw.trim().split("\n");
  const skins: Skin[] = [];
  const seen = new Set<string>();

  for (const line of lines) {
    const parts = line.split("|");
    if (parts.length < 7) continue;
    const weaponType = parts[0].trim();
    const skinNameRaw = parts[1].trim();
    const rarity = parts[2].trim();
    // parts[3] is redundant weapon type, skip it
    const hue = parseFloat(parts[4].trim());
    const saturation = parseFloat(parts[5].trim());
    const value = parseFloat(parts[6].trim());

    // Extract skin name from "SkinName (Condition)"
    let skinName = skinNameRaw;
    const parenIndex = skinNameRaw.indexOf(" (");
    if (parenIndex !== -1) {
      skinName = skinNameRaw.slice(0, parenIndex);
    }

    // Deduplicate by weapon and skin name (souvenirs become duplicates otherwise)
    const key = `${weaponType}::${skinName}`;
    if (seen.has(key)) continue;
    seen.add(key);

    skins.push({
      id: `${weaponType}-${skinName}`.replace(/[^a-zA-Z0-9-]/g, "_"),
      name: `${weaponType} | ${skinNameRaw}`,
      skinName,
      rarity,
      weapon: weaponType,
      hue,
      saturation,
      value: value / 255, // normalize to 0-1
    });
  }
  return skins;
}

// Raw data inline - dominant color
const DOMINANT_RAW = `UMP-45 | Caramel (Factory New)|Consumer Grade|UMP-45|0.09|0.11|84.00
AUG | Hot Rod (Factory New)|Mil-Spec|AUG|0.00|0.84|44.00
Glock-18 | Fade (Factory New)|Restricted|Glock-18|0.08|0.78|59.00
MP9 | Bulldozer (Factory New)|Restricted|MP9|0.15|0.75|255.00
SG 553 | Tornado (Factory New)|Consumer Grade|SG 553|0.61|0.24|38.00
Negev | Anodized Navy (Factory New)|Mil-Spec|Negev|0.10|0.10|71.00
Five-SeveN | Candy Apple (Factory New)|Industrial Grade|Five-SeveN|0.15|0.11|80.00
FAMAS | Contrast Spray (Factory New)|Consumer Grade|FAMAS|0.17|0.02|255.00
M249 | Blizzard Marbleized (Factory New)|Industrial Grade|M249|0.06|0.28|81.00
MP7 | Whiteout (Factory New)|Mil-Spec|MP7|0.17|0.00|255.00
P2000 | Silver (Factory New)|Mil-Spec|P2000|0.15|0.11|84.00
G3SG1 | Arctic Camo (Factory New)|Industrial Grade|G3SG1|0.17|0.02|255.00
Galil AR | Winter Forest (Factory New)|Industrial Grade|Galil AR|0.12|0.10|123.00
XM1014 | Fallout Warning (Factory New)|Industrial Grade|XM1014|0.65|0.11|80.00
M4A4 | Radiation Hazard (Factory New)|Mil-Spec|M4A4|0.00|0.20|5.00
UMP-45 | Fallout Warning (Factory New)|Industrial Grade|UMP-45|0.10|0.11|64.00
PP-Bizon | Irradiated Alert (Factory New)|Consumer Grade|PP-Bizon|0.09|0.37|63.00
P90 | Fallout Warning (Factory New)|Industrial Grade|P90|0.62|0.05|82.00
Tec-9 | Nuclear Threat (Factory New)|Restricted|Tec-9|0.28|0.31|77.00
P250 | Nuclear Threat (Factory New)|Restricted|P250|0.29|0.31|70.00
Sawed-Off | Irradiated Alert (Factory New)|Consumer Grade|Sawed-Off|0.12|0.37|62.00
MAG-7 | Irradiated Alert (Factory New)|Consumer Grade|MAG-7|0.48|0.13|85.00
SCAR-20 | Splash Jam (Factory New)|Classified|SCAR-20|0.08|0.11|55.00
Nova | Modern Hunter (Factory New)|Mil-Spec|Nova|0.11|0.11|53.00
PP-Bizon | Forest Leaves (Factory New)|Consumer Grade|PP-Bizon|0.13|0.58|112.00
PP-Bizon | Modern Hunter (Factory New)|Mil-Spec|PP-Bizon|0.11|0.11|53.00
XM1014 | Blaze Orange (Factory New)|Mil-Spec|XM1014|0.09|0.54|139.00
P250 | Modern Hunter (Factory New)|Mil-Spec|P250|0.13|0.22|167.00
MAC-10 | Tornado (Factory New)|Consumer Grade|MAC-10|0.10|0.31|189.00
Nova | Blaze Orange (Factory New)|Mil-Spec|Nova|0.10|0.11|46.00
XM1014 | Grassland (Factory New)|Consumer Grade|XM1014|0.10|0.41|61.00
P2000 | Grassland Leaves (Factory New)|Industrial Grade|P2000|0.17|0.21|94.00
M4A4 | Modern Hunter (Factory New)|Restricted|M4A4|0.14|0.22|172.00
Nova | Walnut (Factory New)|Consumer Grade|Nova|0.58|0.03|65.00
M4A4 | Tornado (Factory New)|Industrial Grade|M4A4|0.60|0.21|132.00
Tec-9 | Brass (Factory New)|Mil-Spec|Tec-9|0.50|0.04|56.00
P250 | Gunsmoke (Factory New)|Industrial Grade|P250|0.11|0.14|210.00
Dual Berettas | Anodized Navy (Factory New)|Mil-Spec|Dual Berettas|0.00|0.00|30.00
MAG-7 | Sand Dune (Factory New)|Consumer Grade|MAG-7|0.17|0.02|255.00
AK-47 | Black Laminate (Factory New)|Mil-Spec|AK-47|0.17|0.08|61.00
PP-Bizon | Carbon Fiber (Factory New)|Industrial Grade|PP-Bizon|0.17|0.06|16.00
MAC-10 | Urban DDPAT (Factory New)|Consumer Grade|MAC-10|0.07|0.10|67.00
P90 | Glacier Mesh (Factory New)|Mil-Spec|P90|0.50|0.04|255.00
XM1014 | Urban Perforated (Factory New)|Consumer Grade|XM1014|0.17|0.10|20.00
M4A4 | Jungle Tiger (Factory New)|Industrial Grade|M4A4|0.99|0.22|96.00
SSG 08 | Lichen Dashed (Factory New)|Consumer Grade|SSG 08|0.10|0.07|70.00
Five-SeveN | Jungle (Factory New)|Consumer Grade|Five-SeveN|0.35|0.36|147.00
Tec-9 | Ossified (Factory New)|Mil-Spec|Tec-9|0.50|0.04|56.00
Nova | Forest Leaves (Factory New)|Consumer Grade|Nova|0.21|0.39|18.00
AK-47 | Jungle Spray (Factory New)|Industrial Grade|AK-47|0.17|0.03|39.00
AK-47 | Predator (Factory New)|Industrial Grade|AK-47|0.11|0.45|65.00
SCAR-20 | Palm (Factory New)|Industrial Grade|SCAR-20|0.08|0.09|69.00
Sawed-Off | Copper (Factory New)|Mil-Spec|Sawed-Off|0.06|0.69|52.00
M4A4 | Desert Storm (Factory New)|Industrial Grade|M4A4|0.10|0.35|194.00
Glock-18 | Brass (Factory New)|Restricted|Glock-18|0.19|0.12|73.00
P2000 | Scorpion (Factory New)|Restricted|P2000|0.10|0.10|67.00
Desert Eagle | Blaze (Factory New)|Restricted|Desert Eagle|0.08|0.09|23.00
AWP | Snake Camo (Factory New)|Mil-Spec|AWP|0.08|0.10|20.00
AWP | BOOM (Factory New)|Classified|AWP|0.08|0.09|64.00
MAG-7 | Memento (Factory New)|Mil-Spec|MAG-7|0.08|0.26|54.00
Galil AR | Orange DDPAT (Factory New)|Restricted|Galil AR|0.13|0.26|58.00
P250 | Splash (Factory New)|Restricted|P250|0.08|0.25|64.00
Sawed-Off | Orange DDPAT (Factory New)|Restricted|Sawed-Off|0.14|0.23|74.00
M4A4 | Faded Zebra (Factory New)|Mil-Spec|M4A4|0.00|0.00|13.00
AK-47 | Red Laminate (Factory New)|Classified|AK-47|0.17|0.08|61.00
AWP | Lightning Strike (Factory New)|Covert|AWP|0.17|0.09|33.00
AUG | Wings (Factory New)|Mil-Spec|AUG|0.17|0.12|16.00
SG 553 | Ultraviolet (Factory New)|Mil-Spec|SG 553|0.17|0.11|47.00
AK-47 | Case Hardened (Factory New)|Classified|AK-47|0.08|0.05|40.00
Desert Eagle | Hypnotic (Factory New)|Classified|Desert Eagle|0.17|0.09|22.00
Glock-18 | Dragon Tattoo (Factory New)|Restricted|Glock-18|0.00|0.00|47.00
SCAR-20 | Emerald (Factory New)|Restricted|SCAR-20|0.40|0.83|42.00
MP7 | Groundwater (Factory New)|Consumer Grade|MP7|0.15|0.35|102.00
AUG | Anodized Navy (Factory New)|Mil-Spec|AUG|0.59|0.44|34.00
FAMAS | Spitfire (Factory New)|Restricted|FAMAS|0.15|0.39|95.00
PP-Bizon | Rust Coat (Factory New)|Mil-Spec|PP-Bizon|0.07|0.08|59.00
XM1014 | Jungle (Factory New)|Consumer Grade|XM1014|0.38|0.39|41.00
Five-SeveN | Anodized Gunmetal (Factory New)|Consumer Grade|Five-SeveN|0.17|0.06|17.00
P250 | Facets (Factory New)|Industrial Grade|P250|0.10|0.11|75.00
MP9 | Dry Season (Factory New)|Consumer Grade|MP9|0.10|0.31|131.00
Sawed-Off | Mosaico (Factory New)|Industrial Grade|Sawed-Off|0.09|0.59|22.00
MAG-7 | Hazard (Factory New)|Mil-Spec|MAG-7|0.11|0.11|56.00
Negev | Palm (Factory New)|Industrial Grade|Negev|0.17|0.18|255.00
Tec-9 | Tornado (Factory New)|Consumer Grade|Tec-9|0.60|0.21|141.00
M249 | Jungle DDPAT (Factory New)|Consumer Grade|M249|0.17|0.58|31.00
SSG 08 | Mayan Dreams (Factory New)|Industrial Grade|SSG 08|0.09|0.46|123.00
Glock-18 | Sand Dune (Factory New)|Industrial Grade|Glock-18|0.11|0.31|197.00
USP-S | Overgrowth (Factory New)|Restricted|USP-S|0.36|0.43|129.00
AWP | Graphite (Factory New)|Classified|AWP|0.08|0.06|31.00
G3SG1 | Demeter (Factory New)|Mil-Spec|G3SG1|0.42|0.06|66.00
Galil AR | Shattered (Factory New)|Mil-Spec|Galil AR|0.10|0.11|63.00
SG 553 | Wave Spray (Factory New)|Mil-Spec|SG 553|0.40|0.10|136.00
AK-47 | Fire Serpent (Factory New)|Covert|AK-47|0.13|0.08|65.00
UMP-45 | Bone Pile (Factory New)|Mil-Spec|UMP-45|0.20|0.43|72.00
MAC-10 | Graven (Factory New)|Restricted|MAC-10|0.09|0.11|84.00
P2000 | Ocean Foam (Factory New)|Classified|P2000|0.10|0.10|67.00
Dual Berettas | Black Limba (Factory New)|Mil-Spec|Dual Berettas|0.10|0.11|72.00
M4A4 | Zirka (Factory New)|Restricted|M4A4|0.10|0.35|77.00
Desert Eagle | Golden Koi (Factory New)|Covert|Desert Eagle|0.16|0.20|85.00
P90 | Emerald Dragon (Factory New)|Classified|P90|0.18|0.11|87.00
Nova | Tempest (Factory New)|Mil-Spec|Nova|0.64|0.20|56.00
SSG 08 | Blood in the Water (Factory New)|Covert|SSG 08|0.17|0.07|15.00
USP-S | Serum (Factory New)|Classified|USP-S|0.17|0.06|17.00
M4A1-S | Blood Tiger (Factory New)|Mil-Spec|M4A1-S|0.10|0.12|57.00
MP9 | Hypnotic (Factory New)|Restricted|MP9|0.17|0.04|24.00
P90 | Cold Blooded (Factory New)|Classified|P90|0.00|0.06|16.00
Dual Berettas | Hemoglobin (Factory New)|Restricted|Dual Berettas|0.00|0.83|46.00
P250 | Hive (Factory New)|Mil-Spec|P250|0.06|0.90|73.00
Five-SeveN | Case Hardened (Factory New)|Restricted|Five-SeveN|0.23|0.09|58.00
FAMAS | Hexane (Factory New)|Mil-Spec|FAMAS|0.58|0.41|59.00
Tec-9 | Blue Titanium (Factory New)|Mil-Spec|Tec-9|0.18|0.11|90.00
Nova | Graphite (Factory New)|Restricted|Nova|0.08|0.09|23.00
SCAR-20 | Crimson Web (Factory New)|Mil-Spec|SCAR-20|0.08|0.11|55.00
G3SG1 | Desert Storm (Factory New)|Consumer Grade|G3SG1|0.06|0.53|103.00
P250 | Sand Dune (Factory New)|Consumer Grade|P250|0.11|0.31|201.00
Sawed-Off | Snake Camo (Factory New)|Industrial Grade|Sawed-Off|0.11|0.40|149.00
SG 553 | Damascus Steel (Factory New)|Mil-Spec|SG 553|0.11|0.11|28.00
AK-47 | Safari Mesh (Factory New)|Industrial Grade|AK-47|0.18|0.21|84.00
SCAR-20 | Sand Mesh (Factory New)|Consumer Grade|SCAR-20|0.11|0.42|86.00
Five-SeveN | Orange Peel (Factory New)|Industrial Grade|Five-SeveN|0.06|0.52|27.00
P2000 | Amber Fade (Factory New)|Restricted|P2000|0.17|0.11|28.00
P90 | Sand Spray (Factory New)|Consumer Grade|P90|0.10|0.44|27.00
MP9 | Sand Dashed (Factory New)|Consumer Grade|MP9|0.11|0.42|112.00
PP-Bizon | Brass (Factory New)|Mil-Spec|PP-Bizon|0.15|0.67|45.00
MAC-10 | Palm (Factory New)|Industrial Grade|MAC-10|0.13|0.27|224.00
Tec-9 | VariCamo (Factory New)|Industrial Grade|Tec-9|0.06|0.45|94.00
Nova | Predator (Factory New)|Consumer Grade|Nova|0.08|0.42|19.00
M4A1-S | VariCamo (Factory New)|Mil-Spec|M4A1-S|0.08|0.36|64.00
XM1014 | CaliCamo (Factory New)|Industrial Grade|XM1014|0.05|0.45|125.00
Tec-9 | Groundwater (Factory New)|Consumer Grade|Tec-9|0.11|0.39|216.00
Sawed-Off | Full Stop (Factory New)|Mil-Spec|Sawed-Off|0.05|0.40|53.00
AUG | Contractor (Factory New)|Consumer Grade|AUG|0.38|0.17|24.00
M4A1-S | Boreal Forest (Factory New)|Industrial Grade|M4A1-S|0.11|0.27|104.00
FAMAS | Colony (Factory New)|Consumer Grade|FAMAS|0.14|0.36|188.00
UMP-45 | Gunsmoke (Factory New)|Industrial Grade|UMP-45|0.10|0.11|64.00
Nova | Sand Dune (Factory New)|Consumer Grade|Nova|0.12|0.26|39.00
Glock-18 | Candy Apple (Factory New)|Mil-Spec|Glock-18|0.00|0.83|222.00
P2000 | Granite Marbleized (Factory New)|Industrial Grade|P2000|0.62|0.50|56.00
Dual Berettas | Stained (Factory New)|Industrial Grade|Dual Berettas|0.11|0.12|26.00
MP7 | Anodized Navy (Factory New)|Mil-Spec|MP7|0.60|0.49|35.00
PP-Bizon | Sand Dashed (Factory New)|Consumer Grade|PP-Bizon|0.00|0.00|10.00
Nova | Candy Apple (Factory New)|Industrial Grade|Nova|0.09|0.10|86.00
P250 | Boreal Forest (Factory New)|Consumer Grade|P250|0.11|0.27|104.00
USP-S | Night Ops (Factory New)|Mil-Spec|USP-S|0.64|0.23|48.00
Desert Eagle | Mudder (Factory New)|Industrial Grade|Desert Eagle|0.11|0.42|80.00
XM1014 | Blue Spruce (Factory New)|Consumer Grade|XM1014|0.46|0.26|31.00
AUG | Storm (Factory New)|Consumer Grade|AUG|0.19|0.12|75.00
AWP | Safari Mesh (Factory New)|Industrial Grade|AWP|0.08|0.10|20.00
Dual Berettas | Cobalt Quartz (Factory New)|Restricted|Dual Berettas|0.11|0.12|26.00
Galil AR | Sage Spray (Factory New)|Consumer Grade|Galil AR|0.17|0.04|255.00
PP-Bizon | Night Ops (Factory New)|Industrial Grade|PP-Bizon|0.65|0.21|47.00
P90 | Teardown (Factory New)|Mil-Spec|P90|0.63|0.47|97.00
SG 553 | Waves Perforated (Factory New)|Consumer Grade|SG 553|0.47|0.15|131.00
G3SG1 | Jungle Dashed (Factory New)|Consumer Grade|G3SG1|0.11|0.36|61.00
FAMAS | Cyanospatter (Factory New)|Industrial Grade|FAMAS|0.24|0.16|96.00
XM1014 | Blue Steel (Factory New)|Industrial Grade|XM1014|0.60|0.28|18.00
SG 553 | Anodized Navy (Factory New)|Mil-Spec|SG 553|0.60|0.51|37.00
P250 | Bone Mask (Factory New)|Consumer Grade|P250|0.14|0.20|188.00
Negev | CaliCamo (Factory New)|Industrial Grade|Negev|0.08|0.50|4.00
Five-SeveN | Contractor (Factory New)|Consumer Grade|Five-SeveN|0.35|0.15|94.00
AUG | Colony (Factory New)|Consumer Grade|AUG|0.19|0.12|75.00
MAG-7 | Bulldozer (Factory New)|Restricted|MAG-7|0.15|0.75|255.00
MAC-10 | Amber Fade (Factory New)|Mil-Spec|MAC-10|0.10|0.11|62.00
G3SG1 | Safari Mesh (Factory New)|Consumer Grade|G3SG1|0.12|0.32|117.00
SSG 08 | Tropical Storm (Factory New)|Industrial Grade|SSG 08|0.58|0.38|73.00
P90 | Scorched (Factory New)|Consumer Grade|P90|0.00|0.00|24.00
SG 553 | Gator Mesh (Factory New)|Industrial Grade|SG 553|0.17|0.03|39.00
Galil AR | Hunting Blind (Factory New)|Consumer Grade|Galil AR|0.10|0.56|75.00
Glock-18 | Groundwater (Factory New)|Industrial Grade|Glock-18|0.24|0.25|182.00
UMP-45 | Blaze (Factory New)|Mil-Spec|UMP-45|0.08|0.08|25.00
MP7 | Orange Peel (Factory New)|Industrial Grade|MP7|0.06|0.29|148.00
MP9 | Hot Rod (Factory New)|Mil-Spec|MP9|0.00|0.91|44.00
Dual Berettas | Contractor (Factory New)|Consumer Grade|Dual Berettas|0.39|0.15|20.00
SCAR-20 | Contractor (Factory New)|Consumer Grade|SCAR-20|0.33|0.13|23.00
G3SG1 | VariCamo (Factory New)|Industrial Grade|G3SG1|0.06|0.42|90.00
SSG 08 | Blue Spruce (Factory New)|Consumer Grade|SSG 08|0.44|0.23|111.00
SSG 08 | Acid Fade (Factory New)|Mil-Spec|SSG 08|0.22|0.13|23.00
M249 | Gator Mesh (Factory New)|Industrial Grade|M249|0.21|0.29|14.00
Galil AR | VariCamo (Factory New)|Industrial Grade|Galil AR|0.11|0.41|54.00
M4A1-S | Nitro (Factory New)|Restricted|M4A1-S|0.12|0.11|94.00
Tec-9 | Army Mesh (Factory New)|Consumer Grade|Tec-9|0.10|0.12|60.00
Five-SeveN | Silver Quartz (Factory New)|Mil-Spec|Five-SeveN|0.23|0.09|58.00
MP7 | Army Recon (Factory New)|Consumer Grade|MP7|0.18|0.36|74.00
USP-S | Forest Leaves (Factory New)|Industrial Grade|USP-S|0.20|0.43|72.00
AUG | Condemned (Factory New)|Industrial Grade|AUG|0.19|0.12|75.00
FAMAS | Teardown (Factory New)|Mil-Spec|FAMAS|0.63|0.51|95.00
MP9 | Orange Peel (Factory New)|Industrial Grade|MP9|0.06|0.48|92.00
UMP-45 | Urban DDPAT (Factory New)|Consumer Grade|UMP-45|0.10|0.11|64.00
P250 | Metallic DDPAT (Factory New)|Industrial Grade|P250|0.08|0.05|44.00
Dual Berettas | Colony (Factory New)|Consumer Grade|Dual Berettas|0.33|0.05|21.00
G3SG1 | Polar Camo (Factory New)|Consumer Grade|G3SG1|0.17|0.08|13.00
Desert Eagle | Urban Rubble (Factory New)|Mil-Spec|Desert Eagle|0.25|0.02|90.00
Tec-9 | Red Quartz (Factory New)|Restricted|Tec-9|0.50|0.04|56.00
Five-SeveN | Forest Night (Factory New)|Consumer Grade|Five-SeveN|0.55|0.23|123.00
MAG-7 | Metallic DDPAT (Factory New)|Industrial Grade|MAG-7|0.67|0.04|25.00
SCAR-20 | Carbon Fiber (Factory New)|Industrial Grade|SCAR-20|0.10|0.09|53.00
Sawed-Off | Amber Fade (Factory New)|Mil-Spec|Sawed-Off|0.20|0.37|43.00
Nova | Polar Mesh (Factory New)|Consumer Grade|Nova|0.11|0.11|54.00
P90 | Ash Wood (Factory New)|Industrial Grade|P90|0.10|0.20|41.00
PP-Bizon | Urban Dashed (Factory New)|Consumer Grade|PP-Bizon|0.00|0.00|10.00
MAC-10 | Candy Apple (Factory New)|Industrial Grade|MAC-10|0.00|0.83|229.00
M4A4 | Urban DDPAT (Factory New)|Industrial Grade|M4A4|0.10|0.10|68.00
Five-SeveN | Kami (Factory New)|Mil-Spec|Five-SeveN|0.10|0.11|65.00
M249 | Magma (Factory New)|Mil-Spec|M249|0.23|0.25|191.00
PP-Bizon | Cobalt Halftone (Factory New)|Mil-Spec|PP-Bizon|0.61|0.23|79.00
FAMAS | Pulse (Factory New)|Restricted|FAMAS|0.11|0.11|55.00
Dual Berettas | Marina (Factory New)|Restricted|Dual Berettas|0.62|0.60|60.00
MP9 | Rose Iron (Factory New)|Restricted|MP9|0.11|0.08|38.00
Nova | Rising Skull (Factory New)|Restricted|Nova|0.17|0.09|33.00
M4A1-S | Guardian (Factory New)|Classified|M4A1-S|0.56|0.34|88.00
P250 | Mehndi (Factory New)|Classified|P250|0.08|0.25|63.00
Galil AR | Blue Titanium (Factory New)|Mil-Spec|Galil AR|0.18|0.12|85.00
AK-47 | Blue Laminate (Factory New)|Restricted|AK-47|0.17|0.08|61.00
Desert Eagle | Cobalt Disruption (Factory New)|Classified|Desert Eagle|0.59|0.81|16.00
PP-Bizon | Water Sigil (Factory New)|Mil-Spec|PP-Bizon|0.66|0.35|82.00
Nova | Ghost Camo (Factory New)|Mil-Spec|Nova|0.02|0.56|97.00
AWP | Electric Hive (Factory New)|Classified|AWP|0.21|0.14|57.00
M4A4 | X-Ray (Factory New)|Covert|M4A4|0.04|0.44|9.00
G3SG1 | Azure Zebra (Factory New)|Mil-Spec|G3SG1|0.57|0.10|50.00
P250 | Steel Disruption (Factory New)|Mil-Spec|P250|0.57|0.28|36.00
P90 | Blind Spot (Factory New)|Restricted|P90|0.54|0.84|113.00
FAMAS | Afterimage (Factory New)|Classified|FAMAS|0.65|0.12|84.00
Five-SeveN | Nightshade (Factory New)|Mil-Spec|Five-SeveN|0.55|0.31|94.00
Sawed-Off | The Kraken (Factory New)|Covert|Sawed-Off|0.11|0.10|29.00
CZ75-Auto | Crimson Web (Factory New)|Mil-Spec|CZ75-Auto|0.12|0.12|58.00
P2000 | Red FragCam (Factory New)|Mil-Spec|P2000|0.02|0.35|118.00
Dual Berettas | Panther (Factory New)|Mil-Spec|Dual Berettas|0.00|0.78|54.00
USP-S | Stainless (Factory New)|Mil-Spec|USP-S|0.17|0.10|10.00
Glock-18 | Blue Fissure (Factory New)|Mil-Spec|Glock-18|0.63|0.74|118.00
CZ75-Auto | Tread Plate (Factory New)|Restricted|CZ75-Auto|0.17|0.06|31.00
Tec-9 | Titanium Bit (Factory New)|Restricted|Tec-9|0.50|0.04|56.00
Desert Eagle | Heirloom (Factory New)|Restricted|Desert Eagle|0.10|0.12|41.00
Five-SeveN | Copper Galaxy (Factory New)|Restricted|Five-SeveN|0.17|0.06|17.00
CZ75-Auto | The Fuschia Is Now (Factory New)|Classified|CZ75-Auto|0.08|0.11|73.00
P250 | Undertow (Factory New)|Classified|P250|0.17|0.08|48.00
CZ75-Auto | Victoria (Factory New)|Covert|CZ75-Auto|0.17|0.09|45.00
UMP-45 | Corporal (Factory New)|Mil-Spec|UMP-45|0.19|0.12|75.00
Negev | Terrain (Factory New)|Mil-Spec|Negev|0.21|0.13|53.00
MAG-7 | Heaven Guard (Factory New)|Mil-Spec|MAG-7|0.56|0.13|23.00
MAC-10 | Heat (Factory New)|Restricted|MAC-10|0.10|0.11|75.00
USP-S | Guardian (Factory New)|Restricted|USP-S|0.10|0.11|75.00
Nova | Antique (Factory New)|Classified|Nova|0.08|0.21|19.00
AUG | Chameleon (Factory New)|Covert|AUG|0.10|0.11|45.00
★ Gut Knife | Vanilla (Factory New)|Covert|Gut Knife|0.63|0.07|120.00
★ Gut Knife | Blue Steel (Factory New)|Covert|Gut Knife|0.58|0.30|40.00
★ Gut Knife | Boreal Forest (Factory New)|Covert|Gut Knife|0.18|0.10|127.00
★ Gut Knife | Case Hardened (Factory New)|Covert|Gut Knife|0.50|0.27|255.00
★ Gut Knife | Crimson Web (Factory New)|Covert|Gut Knife|0.00|0.69|154.00
★ Gut Knife | Fade (Factory New)|Covert|Gut Knife|0.09|0.71|98.00
★ Gut Knife | Forest DDPAT (Factory New)|Covert|Gut Knife|0.15|0.20|135.00
★ Gut Knife | Night (Factory New)|Covert|Gut Knife|0.58|0.17|78.00
★ Gut Knife | Safari Mesh (Factory New)|Covert|Gut Knife|0.20|0.18|106.00
★ Gut Knife | Scorched (Factory New)|Covert|Gut Knife|0.58|0.04|49.00
★ Gut Knife | Slaughter (Factory New)|Covert|Gut Knife|0.99|0.66|73.00
★ Gut Knife | Stained (Factory New)|Covert|Gut Knife|0.50|0.00|255.00
★ Gut Knife | Urban Masked (Factory New)|Covert|Gut Knife|0.45|0.06|187.00
★ Flip Knife | Vanilla (Factory New)|Covert|Flip Knife|0.67|0.02|94.00
★ Flip Knife | Blue Steel (Factory New)|Covert|Flip Knife|0.58|0.30|33.00
★ Flip Knife | Boreal Forest (Factory New)|Covert|Flip Knife|0.18|0.39|145.00
★ Flip Knife | Case Hardened (Factory New)|Covert|Flip Knife|0.00|0.00|38.00
★ Flip Knife | Crimson Web (Factory New)|Covert|Flip Knife|0.90|0.07|67.00
★ Flip Knife | Fade (Factory New)|Covert|Flip Knife|0.09|0.73|93.00
★ Flip Knife | Forest DDPAT (Factory New)|Covert|Flip Knife|0.27|0.31|101.00
★ Flip Knife | Night (Factory New)|Covert|Flip Knife|0.56|0.09|68.00
★ Flip Knife | Safari Mesh (Factory New)|Covert|Flip Knife|0.22|0.16|95.00
★ Flip Knife | Scorched (Factory New)|Covert|Flip Knife|0.00|0.00|37.00
★ Flip Knife | Slaughter (Factory New)|Covert|Flip Knife|0.00|0.62|104.00
★ Flip Knife | Stained (Factory New)|Covert|Flip Knife|0.42|0.03|67.00
★ Flip Knife | Urban Masked (Factory New)|Covert|Flip Knife|0.27|0.05|177.00
★ Bayonet | Vanilla (Factory New)|Covert|Bayonet|0.58|0.08|195.00
★ Bayonet | Blue Steel (Factory New)|Covert|Bayonet|0.59|0.31|49.00
★ Bayonet | Boreal Forest (Factory New)|Covert|Bayonet|0.13|0.18|132.00
★ Bayonet | Case Hardened (Factory New)|Covert|Bayonet|0.21|0.16|91.00
★ Bayonet | Crimson Web (Factory New)|Covert|Bayonet|0.01|0.69|179.00
★ Bayonet | Fade (Factory New)|Covert|Bayonet|0.97|0.74|112.00
★ Bayonet | Forest DDPAT (Factory New)|Covert|Bayonet|0.27|0.30|123.00
★ Bayonet | Night (Factory New)|Covert|Bayonet|0.56|0.09|87.00
★ Bayonet | Safari Mesh (Factory New)|Covert|Bayonet|0.17|0.20|122.00
★ Bayonet | Scorched (Factory New)|Covert|Bayonet|0.17|0.02|56.00
★ Bayonet | Slaughter (Factory New)|Covert|Bayonet|0.00|0.57|145.00
★ Bayonet | Stained (Factory New)|Covert|Bayonet|0.53|0.05|94.00
★ Bayonet | Urban Masked (Factory New)|Covert|Bayonet|0.28|0.04|213.00
★ M9 Bayonet | Vanilla (Factory New)|Covert|M9 Bayonet|0.56|0.16|137.00
★ M9 Bayonet | Blue Steel (Factory New)|Covert|M9 Bayonet|0.58|0.30|33.00
★ M9 Bayonet | Boreal Forest (Factory New)|Covert|M9 Bayonet|0.16|0.14|108.00
★ M9 Bayonet | Case Hardened (Factory New)|Covert|M9 Bayonet|0.17|0.27|255.00
★ M9 Bayonet | Crimson Web (Factory New)|Covert|M9 Bayonet|0.00|0.71|148.00
★ M9 Bayonet | Fade (Factory New)|Covert|M9 Bayonet|0.98|0.76|99.00
★ M9 Bayonet | Forest DDPAT (Factory New)|Covert|M9 Bayonet|0.15|0.20|129.00
★ M9 Bayonet | Night (Factory New)|Covert|M9 Bayonet|0.57|0.16|73.00
★ M9 Bayonet | Safari Mesh (Factory New)|Covert|M9 Bayonet|0.22|0.16|129.00
★ M9 Bayonet | Scorched (Factory New)|Covert|M9 Bayonet|0.67|0.03|38.00
★ M9 Bayonet | Slaughter (Factory New)|Covert|M9 Bayonet|0.00|0.62|111.00
★ M9 Bayonet | Stained (Factory New)|Covert|M9 Bayonet|0.33|0.03|70.00
★ M9 Bayonet | Urban Masked (Factory New)|Covert|M9 Bayonet|0.53|0.04|112.00
★ Karambit | Vanilla (Factory New)|Covert|Karambit|0.67|0.03|33.00
★ Karambit | Blue Steel (Factory New)|Covert|Karambit|0.50|0.02|255.00
★ Karambit | Boreal Forest (Factory New)|Covert|Karambit|0.17|0.11|108.00
★ Karambit | Case Hardened (Factory New)|Covert|Karambit|0.50|0.04|255.00
★ Karambit | Crimson Web (Factory New)|Covert|Karambit|0.50|0.05|75.00
★ Karambit | Fade (Factory New)|Covert|Karambit|0.53|0.06|89.00
★ Karambit | Forest DDPAT (Factory New)|Covert|Karambit|0.08|0.18|79.00
★ Karambit | Night (Factory New)|Covert|Karambit|0.00|0.01|70.00
★ Karambit | Safari Mesh (Factory New)|Covert|Karambit|0.29|0.12|99.00
★ Karambit | Scorched (Factory New)|Covert|Karambit|0.58|0.05|83.00
★ Karambit | Slaughter (Factory New)|Covert|Karambit|0.53|0.06|89.00
★ Karambit | Stained (Factory New)|Covert|Karambit|0.53|0.06|85.00
★ Karambit | Urban Masked (Factory New)|Covert|Karambit|0.48|0.06|184.00
Tec-9 | Isaac (Factory New)|Mil-Spec|Tec-9|0.11|0.11|53.00
Dual Berettas | Retribution (Factory New)|Mil-Spec|Dual Berettas|0.17|0.08|12.00
Galil AR | Kami (Factory New)|Mil-Spec|Galil AR|0.56|0.05|66.00
P90 | Desert Warfare (Factory New)|Mil-Spec|P90|0.10|0.10|48.00
CZ75-Auto | Poison Dart (Factory New)|Mil-Spec|CZ75-Auto|0.08|0.07|28.00
AUG | Torque (Factory New)|Restricted|AUG|0.07|0.13|38.00
PP-Bizon | Antique (Factory New)|Restricted|PP-Bizon|0.00|0.00|3.00
MAC-10 | Curse (Factory New)|Restricted|MAC-10|0.01|0.52|255.00
XM1014 | Heaven Guard (Factory New)|Restricted|XM1014|0.50|0.04|25.00
M4A1-S | Atomic Alloy (Factory New)|Classified|M4A1-S|0.03|0.33|18.00
SCAR-20 | Cyrex (Factory New)|Classified|SCAR-20|0.08|0.10|77.00
USP-S | Orion (Factory New)|Classified|USP-S|0.08|0.11|54.00
AK-47 | Vulcan (Factory New)|Covert|AK-47|0.10|0.11|47.00
M4A4 | Howl (Factory New)|Contraband|M4A4|0.10|0.11|89.00
P250 | Franklin (Factory New)|Classified|P250|0.14|0.14|221.00
AK-47 | Emerald Pinstripe (Factory New)|Restricted|AK-47|0.17|0.08|61.00
CZ75-Auto | Tuxedo (Factory New)|Mil-Spec|CZ75-Auto|0.14|0.20|84.00
Desert Eagle | Meteorite (Factory New)|Mil-Spec|Desert Eagle|0.10|0.33|15.00
G3SG1 | Green Apple (Factory New)|Industrial Grade|G3SG1|0.10|0.10|78.00
Galil AR | Tuxedo (Factory New)|Mil-Spec|Galil AR|0.14|0.20|85.00
MAC-10 | Silver (Factory New)|Industrial Grade|MAC-10|0.25|0.02|90.00
MP7 | Forest DDPAT (Factory New)|Consumer Grade|MP7|0.12|0.33|120.00
Negev | Army Sheen (Factory New)|Consumer Grade|Negev|0.19|0.12|73.00
Nova | Caged Steel (Factory New)|Industrial Grade|Nova|0.17|0.07|15.00
Sawed-Off | Forest DDPAT (Factory New)|Consumer Grade|Sawed-Off|0.08|0.35|74.00
SG 553 | Army Sheen (Factory New)|Consumer Grade|SG 553|0.11|0.11|28.00
Tec-9 | Urban DDPAT (Factory New)|Consumer Grade|Tec-9|0.10|0.11|66.00
UMP-45 | Carbon Fiber (Factory New)|Industrial Grade|UMP-45|0.10|0.11|64.00
★ Huntsman Knife | Vanilla (Factory New)|Covert|Huntsman Knife|0.67|0.05|41.00
★ Huntsman Knife | Blue Steel (Factory New)|Covert|Huntsman Knife|0.58|0.05|40.00
★ Huntsman Knife | Boreal Forest (Factory New)|Covert|Huntsman Knife|0.17|0.11|114.00
★ Huntsman Knife | Case Hardened (Factory New)|Covert|Huntsman Knife|0.50|0.05|38.00
★ Huntsman Knife | Crimson Web (Factory New)|Covert|Huntsman Knife|0.50|0.05|38.00
★ Huntsman Knife | Fade (Factory New)|Covert|Huntsman Knife|0.17|0.39|255.00
★ Huntsman Knife | Forest DDPAT (Factory New)|Covert|Huntsman Knife|0.15|0.19|129.00
★ Huntsman Knife | Night (Factory New)|Covert|Huntsman Knife|0.58|0.14|78.00
★ Huntsman Knife | Safari Mesh (Factory New)|Covert|Huntsman Knife|0.21|0.16|106.00
★ Huntsman Knife | Scorched (Factory New)|Covert|Huntsman Knife|0.50|0.05|38.00
★ Huntsman Knife | Slaughter (Factory New)|Covert|Huntsman Knife|0.50|0.05|38.00
★ Huntsman Knife | Stained (Factory New)|Covert|Huntsman Knife|0.50|0.05|38.00
★ Huntsman Knife | Urban Masked (Factory New)|Covert|Huntsman Knife|0.50|0.05|38.00
CZ75-Auto | Twist (Factory New)|Mil-Spec|CZ75-Auto|0.14|0.07|97.00
P90 | Module (Factory New)|Mil-Spec|P90|0.49|0.99|111.00
P2000 | Pulse (Factory New)|Mil-Spec|P2000|0.12|0.11|65.00
MAC-10 | Tatter (Factory New)|Restricted|MAC-10|0.18|0.12|85.00
USP-S | Caiman (Factory New)|Classified|USP-S|0.08|0.11|53.00
M4A4 | Desert-Strike (Factory New)|Covert|M4A4|0.00|0.00|3.00
M4A1-S | Cyrex (Factory New)|Covert|M4A1-S|0.01|0.66|255.00
MP7 | Urban Hazard (Factory New)|Mil-Spec|MP7|0.10|0.10|79.00
Negev | Desert-Strike (Factory New)|Mil-Spec|Negev|0.21|0.15|55.00
Nova | Koi (Factory New)|Restricted|Nova|0.17|0.07|15.00
P250 | Supernova (Factory New)|Restricted|P250|0.17|0.07|44.00
SSG 08 | Abyss (Factory New)|Mil-Spec|SSG 08|0.17|0.09|44.00
UMP-45 | Labyrinth (Factory New)|Mil-Spec|UMP-45|0.10|0.11|64.00
PP-Bizon | Osiris (Factory New)|Restricted|PP-Bizon|0.08|0.12|34.00
CZ75-Auto | Tigris (Factory New)|Restricted|CZ75-Auto|0.52|0.22|49.00
Desert Eagle | Conspiracy (Factory New)|Classified|Desert Eagle|0.12|0.10|67.00
Five-SeveN | Fowl Play (Factory New)|Classified|Five-SeveN|0.23|0.09|58.00
Glock-18 | Water Elemental (Factory New)|Classified|Glock-18|0.99|0.68|99.00
P2000 | Ivory (Factory New)|Mil-Spec|P2000|0.17|0.12|255.00
P90 | Asiimov (Factory New)|Covert|P90|0.33|0.05|223.00
P90 | Leather (Factory New)|Industrial Grade|P90|0.18|0.11|87.00
MAC-10 | Commuter (Factory New)|Industrial Grade|MAC-10|0.09|0.11|84.00
Sawed-Off | First Class (Factory New)|Mil-Spec|Sawed-Off|0.17|0.09|35.00
P2000 | Coach Class (Factory New)|Industrial Grade|P2000|0.22|0.08|36.00
USP-S | Business Class (Factory New)|Mil-Spec|USP-S|0.03|0.52|84.00
G3SG1 | Contractor (Factory New)|Consumer Grade|G3SG1|0.10|0.10|80.00
MP7 | Olive Plaid (Factory New)|Consumer Grade|MP7|0.15|0.35|71.00
CZ75-Auto | Green Plaid (Factory New)|Consumer Grade|CZ75-Auto|0.35|0.23|71.00
MP9 | Green Plaid (Factory New)|Consumer Grade|MP9|0.11|0.36|101.00
SSG 08 | Sand Dune (Factory New)|Consumer Grade|SSG 08|0.09|0.28|46.00
SG 553 | Traveler (Factory New)|Industrial Grade|SG 553|0.11|0.11|28.00
XM1014 | Red Leather (Factory New)|Mil-Spec|XM1014|0.17|0.10|60.00
Desert Eagle | Pilot (Factory New)|Restricted|Desert Eagle|0.11|0.13|69.00
AK-47 | Jet Set (Factory New)|Classified|AK-47|0.17|0.08|61.00
AK-47 | First Class (Factory New)|Restricted|AK-47|0.17|0.08|61.00
AWP | Dragon Lore (Factory New)|Covert|AWP|0.11|0.06|51.00
P90 | Storm (Factory New)|Consumer Grade|P90|0.33|0.10|239.00
UMP-45 | Indigo (Factory New)|Consumer Grade|UMP-45|0.43|0.18|92.00
MAC-10 | Indigo (Factory New)|Consumer Grade|MAC-10|0.43|0.18|92.00
SCAR-20 | Storm (Factory New)|Consumer Grade|SCAR-20|0.33|0.10|68.00
USP-S | Royal Blue (Factory New)|Industrial Grade|USP-S|0.68|0.77|66.00
Dual Berettas | Briar (Factory New)|Consumer Grade|Dual Berettas|0.26|0.39|18.00
Nova | Green Apple (Factory New)|Industrial Grade|Nova|0.09|0.10|86.00
MAG-7 | Silver (Factory New)|Industrial Grade|MAG-7|0.14|0.09|82.00
MP9 | Dark Age (Factory New)|Mil-Spec|MP9|0.17|0.08|51.00
Desert Eagle | Hand Cannon (Factory New)|Restricted|Desert Eagle|0.50|0.21|24.00
P2000 | Chainmail (Factory New)|Mil-Spec|P2000|0.15|0.11|81.00
Sawed-Off | Rust Coat (Factory New)|Industrial Grade|Sawed-Off|0.05|0.50|32.00
M4A1-S | Knight (Factory New)|Classified|M4A1-S|0.67|0.03|31.00
CZ75-Auto | Chalice (Factory New)|Restricted|CZ75-Auto|0.11|0.78|49.00
M4A1-S | Master Piece (Factory New)|Classified|M4A1-S|0.08|0.10|125.00
Desert Eagle | Urban DDPAT (Factory New)|Industrial Grade|Desert Eagle|0.10|0.11|63.00
MP7 | Gunsmoke (Factory New)|Industrial Grade|MP7|0.06|0.61|61.00
Glock-18 | Night (Factory New)|Industrial Grade|Glock-18|0.50|0.04|57.00
P2000 | Grassland (Factory New)|Industrial Grade|P2000|0.10|0.44|63.00
CZ75-Auto | Nitro (Factory New)|Mil-Spec|CZ75-Auto|0.13|0.10|92.00
Sawed-Off | Sage Spray (Factory New)|Consumer Grade|Sawed-Off|0.17|0.06|255.00
UMP-45 | Scorched (Factory New)|Consumer Grade|UMP-45|0.00|0.08|25.00
M249 | Contrast Spray (Factory New)|Consumer Grade|M249|0.17|0.01|255.00
MAG-7 | Storm (Factory New)|Consumer Grade|MAG-7|0.34|0.10|224.00
MP9 | Storm (Factory New)|Consumer Grade|MP9|0.33|0.10|227.00
XM1014 | VariCamo Blue (Factory New)|Mil-Spec|XM1014|0.83|0.03|89.00
AWP | Pink DDPAT (Factory New)|Restricted|AWP|0.78|0.04|76.00
USP-S | Road Rash (Factory New)|Restricted|USP-S|0.19|0.12|65.00`;

const AVERAGE_RAW = `UMP-45 | Caramel (Factory New)|Consumer Grade|UMP-45|0.11|0.40|140.00
AUG | Hot Rod (Factory New)|Mil-Spec|AUG|0.03|0.23|117.00
Glock-18 | Fade (Factory New)|Restricted|Glock-18|0.01|0.15|95.00
MP9 | Bulldozer (Factory New)|Restricted|MP9|0.13|0.55|148.00
SG 553 | Tornado (Factory New)|Consumer Grade|SG 553|0.54|0.03|118.00
Negev | Anodized Navy (Factory New)|Mil-Spec|Negev|0.33|0.02|89.00
Five-SeveN | Candy Apple (Factory New)|Industrial Grade|Five-SeveN|0.01|0.38|133.00
FAMAS | Contrast Spray (Factory New)|Consumer Grade|FAMAS|0.12|0.10|145.00
M249 | Blizzard Marbleized (Factory New)|Industrial Grade|M249|0.22|0.04|158.00
MP7 | Whiteout (Factory New)|Mil-Spec|MP7|0.14|0.10|165.00
P2000 | Silver (Factory New)|Mil-Spec|P2000|0.19|0.05|142.00
G3SG1 | Arctic Camo (Factory New)|Industrial Grade|G3SG1|0.27|0.04|129.00
Galil AR | Winter Forest (Factory New)|Industrial Grade|Galil AR|0.22|0.04|156.00
XM1014 | Fallout Warning (Factory New)|Industrial Grade|XM1014|0.00|0.28|95.00
M4A4 | Radiation Hazard (Factory New)|Mil-Spec|M4A4|0.01|0.44|108.00
UMP-45 | Fallout Warning (Factory New)|Industrial Grade|UMP-45|0.01|0.22|97.00
PP-Bizon | Irradiated Alert (Factory New)|Consumer Grade|PP-Bizon|0.09|0.28|88.00
P90 | Fallout Warning (Factory New)|Industrial Grade|P90|0.02|0.27|100.00
Tec-9 | Nuclear Threat (Factory New)|Restricted|Tec-9|0.29|0.45|121.00
P250 | Nuclear Threat (Factory New)|Restricted|P250|0.29|0.45|130.00
Sawed-Off | Irradiated Alert (Factory New)|Consumer Grade|Sawed-Off|0.08|0.33|88.00
MAG-7 | Irradiated Alert (Factory New)|Consumer Grade|MAG-7|0.09|0.27|85.00
SCAR-20 | Splash Jam (Factory New)|Classified|SCAR-20|0.92|0.33|105.00
Nova | Modern Hunter (Factory New)|Mil-Spec|Nova|0.12|0.22|130.00
PP-Bizon | Forest Leaves (Factory New)|Consumer Grade|PP-Bizon|0.15|0.36|86.00
PP-Bizon | Modern Hunter (Factory New)|Mil-Spec|PP-Bizon|0.12|0.25|132.00
XM1014 | Blaze Orange (Factory New)|Mil-Spec|XM1014|0.06|0.61|148.00
P250 | Modern Hunter (Factory New)|Mil-Spec|P250|0.12|0.27|147.00
MAC-10 | Tornado (Factory New)|Consumer Grade|MAC-10|0.58|0.05|127.00
Nova | Blaze Orange (Factory New)|Mil-Spec|Nova|0.05|0.59|132.00
XM1014 | Grassland (Factory New)|Consumer Grade|XM1014|0.13|0.28|155.00
P2000 | Grassland Leaves (Factory New)|Industrial Grade|P2000|0.12|0.27|129.00
M4A4 | Modern Hunter (Factory New)|Restricted|M4A4|0.13|0.21|130.00
Nova | Walnut (Factory New)|Consumer Grade|Nova|0.06|0.24|99.00
M4A4 | Tornado (Factory New)|Industrial Grade|M4A4|0.14|0.05|132.00
Tec-9 | Brass (Factory New)|Mil-Spec|Tec-9|0.16|0.22|82.00
P250 | Gunsmoke (Factory New)|Industrial Grade|P250|0.09|0.21|140.00
Dual Berettas | Anodized Navy (Factory New)|Mil-Spec|Dual Berettas|0.57|0.16|100.00
MAG-7 | Sand Dune (Factory New)|Consumer Grade|MAG-7|0.12|0.28|170.00
AK-47 | Black Laminate (Factory New)|Mil-Spec|AK-47|0.12|0.10|99.00
PP-Bizon | Carbon Fiber (Factory New)|Industrial Grade|PP-Bizon|0.39|0.03|93.00
MAC-10 | Urban DDPAT (Factory New)|Consumer Grade|MAC-10|0.14|0.12|144.00
P90 | Glacier Mesh (Factory New)|Mil-Spec|P90|0.45|0.07|151.00
XM1014 | Urban Perforated (Factory New)|Consumer Grade|XM1014|0.17|0.06|122.00
M4A4 | Jungle Tiger (Factory New)|Industrial Grade|M4A4|0.17|0.12|94.00
SSG 08 | Lichen Dashed (Factory New)|Consumer Grade|SSG 08|0.17|0.21|94.00
Five-SeveN | Jungle (Factory New)|Consumer Grade|Five-SeveN|0.20|0.34|155.00
Tec-9 | Ossified (Factory New)|Mil-Spec|Tec-9|0.22|0.16|79.00
Nova | Forest Leaves (Factory New)|Consumer Grade|Nova|0.15|0.39|87.00
AK-47 | Jungle Spray (Factory New)|Industrial Grade|AK-47|0.20|0.29|94.00
AK-47 | Predator (Factory New)|Industrial Grade|AK-47|0.10|0.38|91.00
SCAR-20 | Palm (Factory New)|Industrial Grade|SCAR-20|0.12|0.28|138.00
Sawed-Off | Copper (Factory New)|Mil-Spec|Sawed-Off|0.06|0.41|110.00
M4A4 | Desert Storm (Factory New)|Industrial Grade|M4A4|0.09|0.27|131.00
Glock-18 | Brass (Factory New)|Restricted|Glock-18|0.16|0.19|98.00
P2000 | Scorpion (Factory New)|Restricted|P2000|0.09|0.30|96.00
Desert Eagle | Blaze (Factory New)|Restricted|Desert Eagle|0.06|0.60|104.00
AWP | Snake Camo (Factory New)|Mil-Spec|AWP|0.11|0.25|108.00
AWP | BOOM (Factory New)|Classified|AWP|0.04|0.50|141.00
MAG-7 | Memento (Factory New)|Mil-Spec|MAG-7|0.08|0.29|86.00
Galil AR | Orange DDPAT (Factory New)|Restricted|Galil AR|0.08|0.40|118.00
P250 | Splash (Factory New)|Restricted|P250|0.07|0.42|113.00
Sawed-Off | Orange DDPAT (Factory New)|Restricted|Sawed-Off|0.08|0.39|103.00
M4A4 | Faded Zebra (Factory New)|Mil-Spec|M4A4|0.14|0.10|108.00
AK-47 | Red Laminate (Factory New)|Classified|AK-47|0.02|0.47|120.00
AWP | Lightning Strike (Factory New)|Covert|AWP|0.78|0.26|92.00
AUG | Wings (Factory New)|Mil-Spec|AUG|0.15|0.07|111.00
SG 553 | Ultraviolet (Factory New)|Mil-Spec|SG 553|0.76|0.30|96.00
AK-47 | Case Hardened (Factory New)|Classified|AK-47|0.04|0.21|80.00
Desert Eagle | Hypnotic (Factory New)|Classified|Desert Eagle|0.10|0.07|113.00
Glock-18 | Dragon Tattoo (Factory New)|Restricted|Glock-18|0.28|0.03|101.00
SCAR-20 | Emerald (Factory New)|Restricted|SCAR-20|0.39|0.28|81.00
MP7 | Groundwater (Factory New)|Consumer Grade|MP7|0.19|0.25|148.00
AUG | Anodized Navy (Factory New)|Mil-Spec|AUG|0.54|0.04|113.00
FAMAS | Spitfire (Factory New)|Restricted|FAMAS|0.09|0.31|108.00
PP-Bizon | Rust Coat (Factory New)|Mil-Spec|PP-Bizon|0.00|0.00|85.00
XM1014 | Jungle (Factory New)|Consumer Grade|XM1014|0.23|0.28|142.00
Five-SeveN | Anodized Gunmetal (Factory New)|Consumer Grade|Five-SeveN|0.17|0.06|95.00
P250 | Facets (Factory New)|Industrial Grade|P250|0.17|0.05|105.00
MP9 | Dry Season (Factory New)|Consumer Grade|MP9|0.11|0.38|127.00
Sawed-Off | Mosaico (Factory New)|Industrial Grade|Sawed-Off|0.11|0.31|106.00
MAG-7 | Hazard (Factory New)|Mil-Spec|MAG-7|0.13|0.61|137.00
Negev | Palm (Factory New)|Industrial Grade|Negev|0.12|0.30|147.00
Tec-9 | Tornado (Factory New)|Consumer Grade|Tec-9|0.13|0.04|124.00
M249 | Jungle DDPAT (Factory New)|Consumer Grade|M249|0.17|0.25|87.00
SSG 08 | Mayan Dreams (Factory New)|Industrial Grade|SSG 08|0.09|0.25|102.00
Glock-18 | Sand Dune (Factory New)|Industrial Grade|Glock-18|0.11|0.26|174.00
USP-S | Overgrowth (Factory New)|Restricted|USP-S|0.19|0.41|127.00
AWP | Graphite (Factory New)|Classified|AWP|0.22|0.03|88.00
G3SG1 | Demeter (Factory New)|Mil-Spec|G3SG1|0.52|0.10|87.00
Galil AR | Shattered (Factory New)|Mil-Spec|Galil AR|0.15|0.06|145.00
SG 553 | Wave Spray (Factory New)|Mil-Spec|SG 553|0.56|0.21|116.00
AK-47 | Fire Serpent (Factory New)|Covert|AK-47|0.12|0.24|100.00
UMP-45 | Bone Pile (Factory New)|Mil-Spec|UMP-45|0.21|0.22|109.00
MAC-10 | Graven (Factory New)|Restricted|MAC-10|0.17|0.25|118.00
P2000 | Ocean Foam (Factory New)|Classified|P2000|0.56|0.14|111.00
Dual Berettas | Black Limba (Factory New)|Mil-Spec|Dual Berettas|0.09|0.27|105.00
M4A4 | Zirka (Factory New)|Restricted|M4A4|0.14|0.26|90.00
Desert Eagle | Golden Koi (Factory New)|Covert|Desert Eagle|0.18|0.13|139.00
P90 | Emerald Dragon (Factory New)|Classified|P90|0.19|0.22|110.00
Nova | Tempest (Factory New)|Mil-Spec|Nova|0.61|0.36|98.00
SSG 08 | Blood in the Water (Factory New)|Covert|SSG 08|0.11|0.07|91.00
USP-S | Serum (Factory New)|Classified|USP-S|0.06|0.25|76.00
M4A1-S | Blood Tiger (Factory New)|Mil-Spec|M4A1-S|0.07|0.31|78.00
MP9 | Hypnotic (Factory New)|Restricted|MP9|0.11|0.08|108.00
P90 | Cold Blooded (Factory New)|Classified|P90|0.02|0.37|111.00
Dual Berettas | Hemoglobin (Factory New)|Restricted|Dual Berettas|0.02|0.35|115.00
P250 | Hive (Factory New)|Mil-Spec|P250|0.05|0.48|92.00
Five-SeveN | Case Hardened (Factory New)|Restricted|Five-SeveN|0.39|0.04|85.00
FAMAS | Hexane (Factory New)|Mil-Spec|FAMAS|0.75|0.12|69.00
Tec-9 | Blue Titanium (Factory New)|Mil-Spec|Tec-9|0.54|0.10|93.00
Nova | Graphite (Factory New)|Restricted|Nova|0.46|0.05|77.00
SCAR-20 | Crimson Web (Factory New)|Mil-Spec|SCAR-20|0.01|0.40|91.00
G3SG1 | Desert Storm (Factory New)|Consumer Grade|G3SG1|0.09|0.26|111.00
P250 | Sand Dune (Factory New)|Consumer Grade|P250|0.11|0.26|171.00
Sawed-Off | Snake Camo (Factory New)|Industrial Grade|Sawed-Off|0.10|0.33|117.00
SG 553 | Damascus Steel (Factory New)|Mil-Spec|SG 553|0.33|0.02|100.00
AK-47 | Safari Mesh (Factory New)|Industrial Grade|AK-47|0.14|0.26|109.00
SCAR-20 | Sand Mesh (Factory New)|Consumer Grade|SCAR-20|0.11|0.32|104.00
Five-SeveN | Orange Peel (Factory New)|Industrial Grade|Five-SeveN|0.06|0.61|150.00
P2000 | Amber Fade (Factory New)|Restricted|P2000|0.11|0.29|100.00
P90 | Sand Spray (Factory New)|Consumer Grade|P90|0.11|0.32|119.00
MP9 | Sand Dashed (Factory New)|Consumer Grade|MP9|0.11|0.34|122.00
PP-Bizon | Brass (Factory New)|Mil-Spec|PP-Bizon|0.15|0.30|92.00
MAC-10 | Palm (Factory New)|Industrial Grade|MAC-10|0.12|0.29|154.00
Tec-9 | VariCamo (Factory New)|Industrial Grade|Tec-9|0.11|0.26|134.00
Nova | Predator (Factory New)|Consumer Grade|Nova|0.10|0.36|89.00
M4A1-S | VariCamo (Factory New)|Mil-Spec|M4A1-S|0.11|0.27|132.00
XM1014 | CaliCamo (Factory New)|Industrial Grade|XM1014|0.08|0.36|137.00
Tec-9 | Groundwater (Factory New)|Consumer Grade|Tec-9|0.20|0.23|134.00
Sawed-Off | Full Stop (Factory New)|Mil-Spec|Sawed-Off|0.03|0.45|88.00
AUG | Contractor (Factory New)|Consumer Grade|AUG|0.17|0.13|114.00
M4A1-S | Boreal Forest (Factory New)|Industrial Grade|M4A1-S|0.17|0.27|99.00
FAMAS | Colony (Factory New)|Consumer Grade|FAMAS|0.15|0.27|143.00
UMP-45 | Gunsmoke (Factory New)|Industrial Grade|UMP-45|0.09|0.18|121.00
Nova | Sand Dune (Factory New)|Consumer Grade|Nova|0.12|0.27|166.00
Glock-18 | Candy Apple (Factory New)|Mil-Spec|Glock-18|0.01|0.34|137.00
P2000 | Granite Marbleized (Factory New)|Industrial Grade|P2000|0.15|0.12|136.00
Dual Berettas | Stained (Factory New)|Industrial Grade|Dual Berettas|0.22|0.03|103.00
MP7 | Anodized Navy (Factory New)|Mil-Spec|MP7|0.56|0.11|102.00
PP-Bizon | Sand Dashed (Factory New)|Consumer Grade|PP-Bizon|0.11|0.33|115.00
Nova | Candy Apple (Factory New)|Industrial Grade|Nova|0.01|0.47|140.00
P250 | Boreal Forest (Factory New)|Consumer Grade|P250|0.18|0.26|103.00
USP-S | Night Ops (Factory New)|Mil-Spec|USP-S|0.42|0.04|99.00
Desert Eagle | Mudder (Factory New)|Industrial Grade|Desert Eagle|0.11|0.36|108.00
XM1014 | Blue Spruce (Factory New)|Consumer Grade|XM1014|0.41|0.19|150.00
AUG | Storm (Factory New)|Consumer Grade|AUG|0.53|0.07|135.00
AWP | Safari Mesh (Factory New)|Industrial Grade|AWP|0.15|0.17|95.00
Dual Berettas | Cobalt Quartz (Factory New)|Restricted|Dual Berettas|0.58|0.34|97.00
Galil AR | Sage Spray (Factory New)|Consumer Grade|Galil AR|0.13|0.20|153.00
PP-Bizon | Night Ops (Factory New)|Industrial Grade|PP-Bizon|0.53|0.06|90.00
P90 | Teardown (Factory New)|Mil-Spec|P90|0.76|0.21|78.00
SG 553 | Waves Perforated (Factory New)|Consumer Grade|SG 553|0.57|0.21|110.00
G3SG1 | Jungle Dashed (Factory New)|Consumer Grade|G3SG1|0.21|0.23|81.00
FAMAS | Cyanospatter (Factory New)|Industrial Grade|FAMAS|0.52|0.21|121.00
XM1014 | Blue Steel (Factory New)|Industrial Grade|XM1014|0.50|0.03|89.00
SG 553 | Anodized Navy (Factory New)|Mil-Spec|SG 553|0.50|0.05|87.00
P250 | Bone Mask (Factory New)|Consumer Grade|P250|0.15|0.18|128.00
Negev | CaliCamo (Factory New)|Industrial Grade|Negev|0.09|0.35|120.00
Five-SeveN | Contractor (Factory New)|Consumer Grade|Five-SeveN|0.12|0.26|138.00
AUG | Colony (Factory New)|Consumer Grade|AUG|0.15|0.21|142.00
MAG-7 | Bulldozer (Factory New)|Restricted|MAG-7|0.14|0.45|141.00
MAC-10 | Amber Fade (Factory New)|Mil-Spec|MAC-10|0.10|0.23|103.00
G3SG1 | Safari Mesh (Factory New)|Consumer Grade|G3SG1|0.15|0.24|99.00
SSG 08 | Tropical Storm (Factory New)|Industrial Grade|SSG 08|0.53|0.11|98.00
P90 | Scorched (Factory New)|Consumer Grade|P90|0.10|0.10|100.00
SG 553 | Gator Mesh (Factory New)|Industrial Grade|SG 553|0.17|0.44|90.00
Galil AR | Hunting Blind (Factory New)|Consumer Grade|Galil AR|0.11|0.44|112.00
Glock-18 | Groundwater (Factory New)|Industrial Grade|Glock-18|0.20|0.22|148.00
UMP-45 | Blaze (Factory New)|Mil-Spec|UMP-45|0.07|0.41|102.00
MP7 | Orange Peel (Factory New)|Industrial Grade|MP7|0.06|0.58|144.00
MP9 | Hot Rod (Factory New)|Mil-Spec|MP9|0.01|0.47|114.00
Dual Berettas | Contractor (Factory New)|Consumer Grade|Dual Berettas|0.18|0.13|97.00
SCAR-20 | Contractor (Factory New)|Consumer Grade|SCAR-20|0.15|0.16|101.00
G3SG1 | VariCamo (Factory New)|Industrial Grade|G3SG1|0.12|0.21|110.00
SSG 08 | Blue Spruce (Factory New)|Consumer Grade|SSG 08|0.41|0.14|114.00
SSG 08 | Acid Fade (Factory New)|Mil-Spec|SSG 08|0.21|0.21|91.00
M249 | Gator Mesh (Factory New)|Industrial Grade|M249|0.17|0.44|97.00
Galil AR | VariCamo (Factory New)|Industrial Grade|Galil AR|0.11|0.26|135.00
M4A1-S | Nitro (Factory New)|Restricted|M4A1-S|0.06|0.25|126.00
Tec-9 | Army Mesh (Factory New)|Consumer Grade|Tec-9|0.10|0.29|93.00
Five-SeveN | Silver Quartz (Factory New)|Mil-Spec|Five-SeveN|0.28|0.03|97.00
MP7 | Army Recon (Factory New)|Consumer Grade|MP7|0.10|0.37|108.00
USP-S | Forest Leaves (Factory New)|Industrial Grade|USP-S|0.15|0.37|92.00
AUG | Condemned (Factory New)|Industrial Grade|AUG|0.08|0.37|120.00
FAMAS | Teardown (Factory New)|Mil-Spec|FAMAS|0.74|0.29|80.00
MP9 | Orange Peel (Factory New)|Industrial Grade|MP9|0.06|0.57|137.00
UMP-45 | Urban DDPAT (Factory New)|Consumer Grade|UMP-45|0.15|0.06|126.00
P250 | Metallic DDPAT (Factory New)|Industrial Grade|P250|0.46|0.04|105.00
Dual Berettas | Colony (Factory New)|Consumer Grade|Dual Berettas|0.15|0.26|131.00
G3SG1 | Polar Camo (Factory New)|Consumer Grade|G3SG1|0.15|0.06|131.00
Desert Eagle | Urban Rubble (Factory New)|Mil-Spec|Desert Eagle|0.10|0.05|103.00
Tec-9 | Red Quartz (Factory New)|Restricted|Tec-9|0.08|0.21|80.00
Five-SeveN | Forest Night (Factory New)|Consumer Grade|Five-SeveN|0.54|0.15|126.00
MAG-7 | Metallic DDPAT (Factory New)|Industrial Grade|MAG-7|0.44|0.03|101.00
SCAR-20 | Carbon Fiber (Factory New)|Industrial Grade|SCAR-20|0.25|0.05|80.00
Sawed-Off | Amber Fade (Factory New)|Mil-Spec|Sawed-Off|0.07|0.36|106.00
Nova | Polar Mesh (Factory New)|Consumer Grade|Nova|0.13|0.07|141.00
P90 | Ash Wood (Factory New)|Industrial Grade|P90|0.14|0.12|137.00
PP-Bizon | Urban Dashed (Factory New)|Consumer Grade|PP-Bizon|0.15|0.06|126.00
MAC-10 | Candy Apple (Factory New)|Industrial Grade|MAC-10|0.01|0.35|129.00
M4A4 | Urban DDPAT (Factory New)|Industrial Grade|M4A4|0.15|0.07|138.00
Five-SeveN | Kami (Factory New)|Mil-Spec|Five-SeveN|0.13|0.16|134.00
M249 | Magma (Factory New)|Mil-Spec|M249|0.06|0.20|80.00
PP-Bizon | Cobalt Halftone (Factory New)|Mil-Spec|PP-Bizon|0.52|0.18|98.00
FAMAS | Pulse (Factory New)|Restricted|FAMAS|0.90|0.60|124.00
Dual Berettas | Marina (Factory New)|Restricted|Dual Berettas|0.10|0.59|120.00
MP9 | Rose Iron (Factory New)|Restricted|MP9|0.08|0.27|104.00
Nova | Rising Skull (Factory New)|Restricted|Nova|0.10|0.23|146.00
M4A1-S | Guardian (Factory New)|Classified|M4A1-S|0.56|0.18|95.00
P250 | Mehndi (Factory New)|Classified|P250|0.06|0.44|131.00
Galil AR | Blue Titanium (Factory New)|Mil-Spec|Galil AR|0.54|0.13|95.00
AK-47 | Blue Laminate (Factory New)|Restricted|AK-47|0.60|0.26|105.00
Desert Eagle | Cobalt Disruption (Factory New)|Classified|Desert Eagle|0.58|0.55|89.00
PP-Bizon | Water Sigil (Factory New)|Mil-Spec|PP-Bizon|0.61|0.20|94.00
Nova | Ghost Camo (Factory New)|Mil-Spec|Nova|0.89|0.07|86.00
AWP | Electric Hive (Factory New)|Classified|AWP|0.94|0.18|85.00
M4A4 | X-Ray (Factory New)|Covert|M4A4|0.73|0.05|110.00
G3SG1 | Azure Zebra (Factory New)|Mil-Spec|G3SG1|0.59|0.52|98.00
P250 | Steel Disruption (Factory New)|Mil-Spec|P250|0.55|0.13|107.00
P90 | Blind Spot (Factory New)|Restricted|P90|0.57|0.23|90.00
FAMAS | Afterimage (Factory New)|Classified|FAMAS|0.82|0.17|92.00
Five-SeveN | Nightshade (Factory New)|Mil-Spec|Five-SeveN|0.33|0.01|110.00
Sawed-Off | The Kraken (Factory New)|Covert|Sawed-Off|0.06|0.43|133.00
CZ75-Auto | Crimson Web (Factory New)|Mil-Spec|CZ75-Auto|0.02|0.32|104.00
P2000 | Red FragCam (Factory New)|Mil-Spec|P2000|0.00|0.44|100.00
Dual Berettas | Panther (Factory New)|Mil-Spec|Dual Berettas|0.01|0.41|124.00
USP-S | Stainless (Factory New)|Mil-Spec|USP-S|0.39|0.04|72.00
Glock-18 | Blue Fissure (Factory New)|Mil-Spec|Glock-18|0.66|0.20|103.00
CZ75-Auto | Tread Plate (Factory New)|Restricted|CZ75-Auto|0.21|0.04|108.00
Tec-9 | Titanium Bit (Factory New)|Restricted|Tec-9|0.56|0.10|80.00
Desert Eagle | Heirloom (Factory New)|Restricted|Desert Eagle|0.13|0.10|87.00
Five-SeveN | Copper Galaxy (Factory New)|Restricted|Five-SeveN|0.08|0.32|87.00
CZ75-Auto | The Fuschia Is Now (Factory New)|Classified|CZ75-Auto|0.93|0.17|116.00
P250 | Undertow (Factory New)|Classified|P250|0.54|0.49|102.00
CZ75-Auto | Victoria (Factory New)|Covert|CZ75-Auto|0.13|0.10|96.00
UMP-45 | Corporal (Factory New)|Mil-Spec|UMP-45|0.13|0.15|118.00
Negev | Terrain (Factory New)|Mil-Spec|Negev|0.45|0.37|95.00
MAG-7 | Heaven Guard (Factory New)|Mil-Spec|MAG-7|0.00|0.10|105.00
MAC-10 | Heat (Factory New)|Restricted|MAC-10|0.07|0.42|137.00
USP-S | Guardian (Factory New)|Restricted|USP-S|0.33|0.04|83.00
Nova | Antique (Factory New)|Classified|Nova|0.07|0.53|107.00
AUG | Chameleon (Factory New)|Covert|AUG|0.18|0.16|98.00
★ Gut Knife | Vanilla (Factory New)|Covert|Gut Knife|0.01|0.19|99.00
★ Gut Knife | Blue Steel (Factory New)|Covert|Gut Knife|0.01|0.25|99.00
★ Gut Knife | Boreal Forest (Factory New)|Covert|Gut Knife|0.19|0.18|119.00
★ Gut Knife | Case Hardened (Factory New)|Covert|Gut Knife|0.04|0.17|120.00
★ Gut Knife | Crimson Web (Factory New)|Covert|Gut Knife|0.01|0.36|119.00
★ Gut Knife | Fade (Factory New)|Covert|Gut Knife|0.01|0.42|141.00
★ Gut Knife | Forest DDPAT (Factory New)|Covert|Gut Knife|0.23|0.20|120.00
★ Gut Knife | Night (Factory New)|Covert|Gut Knife|0.55|0.18|100.00
★ Gut Knife | Safari Mesh (Factory New)|Covert|Gut Knife|0.18|0.17|120.00
★ Gut Knife | Scorched (Factory New)|Covert|Gut Knife|0.13|0.04|121.00
★ Gut Knife | Slaughter (Factory New)|Covert|Gut Knife|0.01|0.47|138.00
★ Gut Knife | Stained (Factory New)|Covert|Gut Knife|0.99|0.16|119.00
★ Gut Knife | Urban Masked (Factory New)|Covert|Gut Knife|0.44|0.04|160.00
★ Flip Knife | Vanilla (Factory New)|Covert|Flip Knife|0.50|0.03|104.00
★ Flip Knife | Blue Steel (Factory New)|Covert|Flip Knife|0.45|0.09|77.00
★ Flip Knife | Boreal Forest (Factory New)|Covert|Flip Knife|0.17|0.19|108.00
★ Flip Knife | Case Hardened (Factory New)|Covert|Flip Knife|0.17|0.19|108.00
★ Flip Knife | Crimson Web (Factory New)|Covert|Flip Knife|0.01|0.37|104.00
★ Flip Knife | Fade (Factory New)|Covert|Flip Knife|0.03|0.23|100.00
★ Flip Knife | Forest DDPAT (Factory New)|Covert|Flip Knife|0.20|0.20|109.00
★ Flip Knife | Night (Factory New)|Covert|Flip Knife|0.54|0.13|89.00
★ Flip Knife | Safari Mesh (Factory New)|Covert|Flip Knife|0.18|0.17|111.00
★ Flip Knife | Scorched (Factory New)|Covert|Flip Knife|0.10|0.05|93.00
★ Flip Knife | Slaughter (Factory New)|Covert|Flip Knife|0.02|0.32|111.00
★ Flip Knife | Stained (Factory New)|Covert|Flip Knife|0.44|0.06|94.00
★ Flip Knife | Urban Masked (Factory New)|Covert|Flip Knife|0.38|0.03|154.00
★ Bayonet | Vanilla (Factory New)|Covert|Bayonet|0.53|0.04|157.00
★ Bayonet | Blue Steel (Factory New)|Covert|Bayonet|0.27|0.10|106.00
★ Bayonet | Boreal Forest (Factory New)|Covert|Bayonet|0.21|0.22|119.00
★ Bayonet | Case Hardened (Factory New)|Covert|Bayonet|0.19|0.16|140.00
★ Bayonet | Crimson Web (Factory New)|Covert|Bayonet|0.01|0.40|116.00
★ Bayonet | Fade (Factory New)|Covert|Bayonet|0.07|0.27|128.00
★ Bayonet | Forest DDPAT (Factory New)|Covert|Bayonet|0.21|0.21|122.00
★ Bayonet | Night (Factory New)|Covert|Bayonet|0.56|0.16|94.00
★ Bayonet | Safari Mesh (Factory New)|Covert|Bayonet|0.18|0.19|122.00
★ Bayonet | Scorched (Factory New)|Covert|Bayonet|0.10|0.05|108.00
★ Bayonet | Slaughter (Factory New)|Covert|Bayonet|0.04|0.33|141.00
★ Bayonet | Stained (Factory New)|Covert|Bayonet|0.29|0.07|120.00
★ Bayonet | Urban Masked (Factory New)|Covert|Bayonet|0.40|0.03|165.00
★ M9 Bayonet | Vanilla (Factory New)|Covert|M9 Bayonet|0.56|0.12|112.00
★ M9 Bayonet | Blue Steel (Factory New)|Covert|M9 Bayonet|0.60|0.19|75.00
★ M9 Bayonet | Boreal Forest (Factory New)|Covert|M9 Bayonet|0.20|0.21|111.00
★ M9 Bayonet | Case Hardened (Factory New)|Covert|M9 Bayonet|0.13|0.17|112.00
★ M9 Bayonet | Crimson Web (Factory New)|Covert|M9 Bayonet|0.00|0.40|111.00
★ M9 Bayonet | Fade (Factory New)|Covert|M9 Bayonet|0.01|0.28|115.00
★ M9 Bayonet | Forest DDPAT (Factory New)|Covert|M9 Bayonet|0.22|0.21|111.00
★ M9 Bayonet | Night (Factory New)|Covert|M9 Bayonet|0.56|0.19|90.00
★ M9 Bayonet | Safari Mesh (Factory New)|Covert|M9 Bayonet|0.18|0.17|115.00
★ M9 Bayonet | Scorched (Factory New)|Covert|M9 Bayonet|0.08|0.05|112.00
★ M9 Bayonet | Slaughter (Factory New)|Covert|M9 Bayonet|0.99|0.36|121.00
★ M9 Bayonet | Stained (Factory New)|Covert|M9 Bayonet|0.57|0.12|113.00
★ M9 Bayonet | Urban Masked (Factory New)|Covert|M9 Bayonet|0.43|0.03|150.00
★ Karambit | Vanilla (Factory New)|Covert|Karambit|0.57|0.06|85.00
★ Karambit | Blue Steel (Factory New)|Covert|Karambit|0.58|0.18|117.00
★ Karambit | Boreal Forest (Factory New)|Covert|Karambit|0.30|0.19|115.00
★ Karambit | Case Hardened (Factory New)|Covert|Karambit|0.19|0.08|142.00
★ Karambit | Crimson Web (Factory New)|Covert|Karambit|0.01|0.27|113.00
★ Karambit | Fade (Factory New)|Covert|Karambit|0.90|0.20|126.00
★ Karambit | Forest DDPAT (Factory New)|Covert|Karambit|0.18|0.15|112.00
★ Karambit | Night (Factory New)|Covert|Karambit|0.54|0.04|89.00
★ Karambit | Safari Mesh (Factory New)|Covert|Karambit|0.19|0.15|119.00
★ Karambit | Scorched (Factory New)|Covert|Karambit|0.11|0.04|138.00
★ Karambit | Slaughter (Factory New)|Covert|Karambit|0.99|0.27|142.00
★ Karambit | Stained (Factory New)|Covert|Karambit|0.57|0.09|128.00
★ Karambit | Urban Masked (Factory New)|Covert|Karambit|0.47|0.04|154.00
Tec-9 | Isaac (Factory New)|Mil-Spec|Tec-9|0.01|0.34|106.00
Dual Berettas | Retribution (Factory New)|Mil-Spec|Dual Berettas|0.16|0.29|92.00
Galil AR | Kami (Factory New)|Mil-Spec|Galil AR|0.14|0.16|138.00
P90 | Desert Warfare (Factory New)|Mil-Spec|P90|0.14|0.28|110.00
CZ75-Auto | Poison Dart (Factory New)|Mil-Spec|CZ75-Auto|0.50|0.05|95.00
AUG | Torque (Factory New)|Restricted|AUG|0.17|0.15|117.00
PP-Bizon | Antique (Factory New)|Restricted|PP-Bizon|0.08|0.46|101.00
MAC-10 | Curse (Factory New)|Restricted|MAC-10|0.08|0.29|144.00
XM1014 | Heaven Guard (Factory New)|Restricted|XM1014|0.98|0.15|117.00
M4A1-S | Atomic Alloy (Factory New)|Classified|M4A1-S|0.05|0.53|89.00
SCAR-20 | Cyrex (Factory New)|Classified|SCAR-20|0.05|0.16|104.00
USP-S | Orion (Factory New)|Classified|USP-S|0.08|0.52|126.00
AK-47 | Vulcan (Factory New)|Covert|AK-47|0.48|0.06|122.00
M4A4 | Howl (Factory New)|Contraband|M4A4|0.04|0.54|127.00
P250 | Franklin (Factory New)|Classified|P250|0.18|0.12|138.00
AK-47 | Emerald Pinstripe (Factory New)|Restricted|AK-47|0.23|0.09|87.00
CZ75-Auto | Tuxedo (Factory New)|Mil-Spec|CZ75-Auto|0.13|0.13|117.00
Desert Eagle | Meteorite (Factory New)|Mil-Spec|Desert Eagle|0.15|0.14|73.00
G3SG1 | Green Apple (Factory New)|Industrial Grade|G3SG1|0.28|0.44|119.00
Galil AR | Tuxedo (Factory New)|Mil-Spec|Galil AR|0.15|0.11|127.00
MAC-10 | Silver (Factory New)|Industrial Grade|MAC-10|0.14|0.09|116.00
MP7 | Forest DDPAT (Factory New)|Consumer Grade|MP7|0.15|0.25|110.00
Negev | Army Sheen (Factory New)|Consumer Grade|Negev|0.18|0.12|85.00
Nova | Caged Steel (Factory New)|Industrial Grade|Nova|0.42|0.05|83.00
Sawed-Off | Forest DDPAT (Factory New)|Consumer Grade|Sawed-Off|0.17|0.24|99.00
SG 553 | Army Sheen (Factory New)|Consumer Grade|SG 553|0.19|0.08|92.00
Tec-9 | Urban DDPAT (Factory New)|Consumer Grade|Tec-9|0.13|0.07|126.00
UMP-45 | Carbon Fiber (Factory New)|Industrial Grade|UMP-45|0.20|0.05|101.00
★ Huntsman Knife | Vanilla (Factory New)|Covert|Huntsman Knife|0.57|0.06|83.00
★ Huntsman Knife | Blue Steel (Factory New)|Covert|Huntsman Knife|0.57|0.27|141.00
★ Huntsman Knife | Boreal Forest (Factory New)|Covert|Huntsman Knife|0.21|0.17|103.00
★ Huntsman Knife | Case Hardened (Factory New)|Covert|Huntsman Knife|0.61|0.04|151.00
★ Huntsman Knife | Crimson Web (Factory New)|Covert|Huntsman Knife|0.00|0.38|117.00
★ Huntsman Knife | Fade (Factory New)|Covert|Huntsman Knife|0.07|0.34|166.00
★ Huntsman Knife | Forest DDPAT (Factory New)|Covert|Huntsman Knife|0.20|0.16|109.00
★ Huntsman Knife | Night (Factory New)|Covert|Huntsman Knife|0.56|0.10|79.00
★ Huntsman Knife | Safari Mesh (Factory New)|Covert|Huntsman Knife|0.19|0.14|103.00
★ Huntsman Knife | Scorched (Factory New)|Covert|Huntsman Knife|0.10|0.03|143.00
★ Huntsman Knife | Slaughter (Factory New)|Covert|Huntsman Knife|0.99|0.39|155.00
★ Huntsman Knife | Stained (Factory New)|Covert|Huntsman Knife|0.58|0.15|157.00
★ Huntsman Knife | Urban Masked (Factory New)|Covert|Huntsman Knife|0.47|0.04|136.00
CZ75-Auto | Twist (Factory New)|Mil-Spec|CZ75-Auto|0.25|0.04|110.00
P90 | Module (Factory New)|Mil-Spec|P90|0.53|0.43|84.00
P2000 | Pulse (Factory New)|Mil-Spec|P2000|0.36|0.37|124.00
MAC-10 | Tatter (Factory New)|Restricted|MAC-10|0.07|0.25|121.00
USP-S | Caiman (Factory New)|Classified|USP-S|0.06|0.13|83.00
M4A4 | Desert-Strike (Factory New)|Covert|M4A4|0.11|0.28|116.00
M4A1-S | Cyrex (Factory New)|Covert|M4A1-S|0.02|0.28|108.00
MP7 | Urban Hazard (Factory New)|Mil-Spec|MP7|0.07|0.35|110.00
Negev | Desert-Strike (Factory New)|Mil-Spec|Negev|0.11|0.29|115.00
Nova | Koi (Factory New)|Restricted|Nova|0.06|0.29|135.00
P250 | Supernova (Factory New)|Restricted|P250|0.07|0.27|89.00
SSG 08 | Abyss (Factory New)|Mil-Spec|SSG 08|0.55|0.22|88.00
UMP-45 | Labyrinth (Factory New)|Mil-Spec|UMP-45|0.12|0.16|134.00
PP-Bizon | Osiris (Factory New)|Restricted|PP-Bizon|0.10|0.35|122.00
CZ75-Auto | Tigris (Factory New)|Restricted|CZ75-Auto|0.07|0.51|92.00
Desert Eagle | Conspiracy (Factory New)|Classified|Desert Eagle|0.12|0.10|97.00
Five-SeveN | Fowl Play (Factory New)|Classified|Five-SeveN|0.24|0.08|98.00
Glock-18 | Water Elemental (Factory New)|Classified|Glock-18|0.97|0.30|79.00
P2000 | Ivory (Factory New)|Mil-Spec|P2000|0.12|0.05|185.00
P90 | Asiimov (Factory New)|Covert|P90|0.07|0.22|183.00
P90 | Leather (Factory New)|Industrial Grade|P90|0.12|0.09|99.00
MAC-10 | Commuter (Factory New)|Industrial Grade|MAC-10|0.11|0.13|119.00
Sawed-Off | First Class (Factory New)|Mil-Spec|Sawed-Off|0.13|0.12|133.00
P2000 | Coach Class (Factory New)|Industrial Grade|P2000|0.46|0.05|82.00
USP-S | Business Class (Factory New)|Mil-Spec|USP-S|0.53|0.12|84.00
G3SG1 | Contractor (Factory New)|Consumer Grade|G3SG1|0.14|0.14|110.00
MP7 | Olive Plaid (Factory New)|Consumer Grade|MP7|0.10|0.28|91.00
CZ75-Auto | Green Plaid (Factory New)|Consumer Grade|CZ75-Auto|0.14|0.22|110.00
MP9 | Green Plaid (Factory New)|Consumer Grade|MP9|0.12|0.26|130.00
SSG 08 | Sand Dune (Factory New)|Consumer Grade|SSG 08|0.10|0.21|120.00
SG 553 | Traveler (Factory New)|Industrial Grade|SG 553|0.32|0.04|98.00
XM1014 | Red Leather (Factory New)|Mil-Spec|XM1014|0.01|0.41|97.00
Desert Eagle | Pilot (Factory New)|Restricted|Desert Eagle|0.11|0.13|115.00
AK-47 | Jet Set (Factory New)|Classified|AK-47|0.57|0.19|100.00
AK-47 | First Class (Factory New)|Restricted|AK-47|0.12|0.25|129.00
AWP | Dragon Lore (Factory New)|Covert|AWP|0.11|0.27|149.00
P90 | Storm (Factory New)|Consumer Grade|P90|0.48|0.03|167.00
UMP-45 | Indigo (Factory New)|Consumer Grade|UMP-45|0.56|0.12|134.00
MAC-10 | Indigo (Factory New)|Consumer Grade|MAC-10|0.57|0.14|128.00
SCAR-20 | Storm (Factory New)|Consumer Grade|SCAR-20|0.48|0.03|110.00
USP-S | Royal Blue (Factory New)|Industrial Grade|USP-S|0.64|0.40|94.00
Dual Berettas | Briar (Factory New)|Consumer Grade|Dual Berettas|0.17|0.39|84.00
Nova | Green Apple (Factory New)|Industrial Grade|Nova|0.25|0.30|127.00
MAG-7 | Silver (Factory New)|Industrial Grade|MAG-7|0.12|0.07|118.00
MP9 | Dark Age (Factory New)|Mil-Spec|MP9|0.11|0.17|92.00
Desert Eagle | Hand Cannon (Factory New)|Restricted|Desert Eagle|0.07|0.44|116.00
P2000 | Chainmail (Factory New)|Mil-Spec|P2000|0.13|0.12|102.00
Sawed-Off | Rust Coat (Factory New)|Industrial Grade|Sawed-Off|0.04|0.56|95.00
M4A1-S | Knight (Factory New)|Classified|M4A1-S|0.55|0.05|87.00
CZ75-Auto | Chalice (Factory New)|Restricted|CZ75-Auto|0.07|0.34|118.00
M4A1-S | Master Piece (Factory New)|Classified|M4A1-S|0.12|0.30|140.00
Desert Eagle | Urban DDPAT (Factory New)|Industrial Grade|Desert Eagle|0.16|0.07|103.00
MP7 | Gunsmoke (Factory New)|Industrial Grade|MP7|0.06|0.43|112.00
Glock-18 | Night (Factory New)|Industrial Grade|Glock-18|0.56|0.07|90.00
P2000 | Grassland (Factory New)|Industrial Grade|P2000|0.08|0.38|131.00
CZ75-Auto | Nitro (Factory New)|Mil-Spec|CZ75-Auto|0.12|0.22|128.00
Sawed-Off | Sage Spray (Factory New)|Consumer Grade|Sawed-Off|0.15|0.08|183.00
UMP-45 | Scorched (Factory New)|Consumer Grade|UMP-45|0.08|0.11|108.00
M249 | Contrast Spray (Factory New)|Consumer Grade|M249|0.15|0.04|163.00
MAG-7 | Storm (Factory New)|Consumer Grade|MAG-7|0.48|0.05|133.00
MP9 | Storm (Factory New)|Consumer Grade|MP9|0.46|0.03|169.00
XM1014 | VariCamo Blue (Factory New)|Mil-Spec|XM1014|0.55|0.03|125.00
AWP | Pink DDPAT (Factory New)|Restricted|AWP|0.95|0.06|108.00
USP-S | Road Rash (Factory New)|Restricted|USP-S|0.14|0.16|107.00`;

const WEIGHTED_RAW = `UMP-45 | Caramel (Factory New)|Consumer Grade|UMP-45|0.11|0.31|108.00
AUG | Hot Rod (Factory New)|Mil-Spec|AUG|0.02|0.30|86.00
Glock-18 | Fade (Factory New)|Restricted|Glock-18|0.04|0.21|72.00
MP9 | Bulldozer (Factory New)|Restricted|MP9|0.15|0.62|188.00
SG 553 | Tornado (Factory New)|Consumer Grade|SG 553|0.58|0.06|104.00
Negev | Anodized Navy (Factory New)|Mil-Spec|Negev|0.17|0.03|71.00
Five-SeveN | Candy Apple (Factory New)|Industrial Grade|Five-SeveN|0.01|0.50|133.00
FAMAS | Contrast Spray (Factory New)|Consumer Grade|FAMAS|0.12|0.10|134.00
M249 | Blizzard Marbleized (Factory New)|Industrial Grade|M249|0.19|0.04|145.00
MP7 | Whiteout (Factory New)|Mil-Spec|MP7|0.15|0.09|200.00
P2000 | Silver (Factory New)|Mil-Spec|P2000|0.17|0.05|113.00
G3SG1 | Arctic Camo (Factory New)|Industrial Grade|G3SG1|0.20|0.05|107.00
Galil AR | Winter Forest (Factory New)|Industrial Grade|Galil AR|0.17|0.04|145.00
XM1014 | Fallout Warning (Factory New)|Industrial Grade|XM1014|0.99|0.30|86.00
M4A4 | Radiation Hazard (Factory New)|Mil-Spec|M4A4|0.02|0.47|101.00
UMP-45 | Fallout Warning (Factory New)|Industrial Grade|UMP-45|0.02|0.20|88.00
PP-Bizon | Irradiated Alert (Factory New)|Consumer Grade|PP-Bizon|0.09|0.28|80.00
P90 | Fallout Warning (Factory New)|Industrial Grade|P90|0.01|0.24|86.00
Tec-9 | Nuclear Threat (Factory New)|Restricted|Tec-9|0.29|0.46|108.00
P250 | Nuclear Threat (Factory New)|Restricted|P250|0.29|0.45|110.00
Sawed-Off | Irradiated Alert (Factory New)|Consumer Grade|Sawed-Off|0.08|0.34|77.00
MAG-7 | Irradiated Alert (Factory New)|Consumer Grade|MAG-7|0.09|0.26|77.00
SCAR-20 | Splash Jam (Factory New)|Classified|SCAR-20|0.94|0.25|79.00
Nova | Modern Hunter (Factory New)|Mil-Spec|Nova|0.12|0.19|104.00
PP-Bizon | Forest Leaves (Factory New)|Consumer Grade|PP-Bizon|0.14|0.41|81.00
PP-Bizon | Modern Hunter (Factory New)|Mil-Spec|PP-Bizon|0.13|0.22|118.00
XM1014 | Blaze Orange (Factory New)|Mil-Spec|XM1014|0.05|0.62|143.00
P250 | Modern Hunter (Factory New)|Mil-Spec|P250|0.13|0.24|143.00
MAC-10 | Tornado (Factory New)|Consumer Grade|MAC-10|0.33|0.01|129.00
Nova | Blaze Orange (Factory New)|Mil-Spec|Nova|0.06|0.55|109.00
XM1014 | Grassland (Factory New)|Consumer Grade|XM1014|0.12|0.28|156.00
P2000 | Grassland Leaves (Factory New)|Industrial Grade|P2000|0.13|0.28|117.00
M4A4 | Modern Hunter (Factory New)|Restricted|M4A4|0.14|0.18|122.00
Nova | Walnut (Factory New)|Consumer Grade|Nova|0.07|0.24|83.00
M4A4 | Tornado (Factory New)|Industrial Grade|M4A4|0.13|0.04|128.00
Tec-9 | Brass (Factory New)|Mil-Spec|Tec-9|0.17|0.16|70.00
P250 | Gunsmoke (Factory New)|Industrial Grade|P250|0.09|0.19|144.00
Dual Berettas | Anodized Navy (Factory New)|Mil-Spec|Dual Berettas|0.58|0.22|69.00
MAG-7 | Sand Dune (Factory New)|Consumer Grade|MAG-7|0.12|0.28|184.00
AK-47 | Black Laminate (Factory New)|Mil-Spec|AK-47|0.12|0.11|75.00
PP-Bizon | Carbon Fiber (Factory New)|Industrial Grade|PP-Bizon|0.17|0.03|63.00
MAC-10 | Urban DDPAT (Factory New)|Consumer Grade|MAC-10|0.13|0.10|127.00
P90 | Glacier Mesh (Factory New)|Mil-Spec|P90|0.44|0.06|149.00
XM1014 | Urban Perforated (Factory New)|Consumer Grade|XM1014|0.17|0.06|99.00
M4A4 | Jungle Tiger (Factory New)|Industrial Grade|M4A4|0.14|0.13|83.00
SSG 08 | Lichen Dashed (Factory New)|Consumer Grade|SSG 08|0.18|0.21|77.00
Five-SeveN | Jungle (Factory New)|Consumer Grade|Five-SeveN|0.21|0.36|158.00
Tec-9 | Ossified (Factory New)|Mil-Spec|Tec-9|0.20|0.14|65.00
Nova | Forest Leaves (Factory New)|Consumer Grade|Nova|0.16|0.41|74.00
AK-47 | Jungle Spray (Factory New)|Industrial Grade|AK-47|0.19|0.29|84.00
AK-47 | Predator (Factory New)|Industrial Grade|AK-47|0.10|0.40|80.00
SCAR-20 | Palm (Factory New)|Industrial Grade|SCAR-20|0.12|0.27|123.00
Sawed-Off | Copper (Factory New)|Mil-Spec|Sawed-Off|0.06|0.43|91.00
M4A4 | Desert Storm (Factory New)|Industrial Grade|M4A4|0.08|0.32|122.00
Glock-18 | Brass (Factory New)|Restricted|Glock-18|0.14|0.21|71.00
P2000 | Scorpion (Factory New)|Restricted|P2000|0.08|0.29|75.00
Desert Eagle | Blaze (Factory New)|Restricted|Desert Eagle|0.07|0.56|72.00
AWP | Snake Camo (Factory New)|Mil-Spec|AWP|0.11|0.25|97.00
AWP | BOOM (Factory New)|Classified|AWP|0.04|0.52|127.00
MAG-7 | Memento (Factory New)|Mil-Spec|MAG-7|0.09|0.23|66.00
Galil AR | Orange DDPAT (Factory New)|Restricted|Galil AR|0.09|0.33|93.00
P250 | Splash (Factory New)|Restricted|P250|0.08|0.45|97.00
Sawed-Off | Orange DDPAT (Factory New)|Restricted|Sawed-Off|0.10|0.32|76.00
M4A4 | Faded Zebra (Factory New)|Mil-Spec|M4A4|0.13|0.11|94.00
AK-47 | Red Laminate (Factory New)|Classified|AK-47|0.03|0.34|90.00
AWP | Lightning Strike (Factory New)|Covert|AWP|0.78|0.23|74.00
AUG | Wings (Factory New)|Mil-Spec|AUG|0.12|0.09|79.00
SG 553 | Ultraviolet (Factory New)|Mil-Spec|SG 553|0.77|0.35|72.00
AK-47 | Case Hardened (Factory New)|Classified|AK-47|0.05|0.25|77.00
Desert Eagle | Hypnotic (Factory New)|Classified|Desert Eagle|0.10|0.09|76.00
Glock-18 | Dragon Tattoo (Factory New)|Restricted|Glock-18|0.17|0.06|69.00
SCAR-20 | Emerald (Factory New)|Restricted|SCAR-20|0.37|0.24|59.00
MP7 | Groundwater (Factory New)|Consumer Grade|MP7|0.20|0.24|153.00
AUG | Anodized Navy (Factory New)|Mil-Spec|AUG|0.56|0.08|77.00
FAMAS | Spitfire (Factory New)|Restricted|FAMAS|0.12|0.33|97.00
PP-Bizon | Rust Coat (Factory New)|Mil-Spec|PP-Bizon|0.17|0.01|72.00
XM1014 | Jungle (Factory New)|Consumer Grade|XM1014|0.24|0.27|131.00
Five-SeveN | Anodized Gunmetal (Factory New)|Consumer Grade|Five-SeveN|0.14|0.09|68.00
P250 | Facets (Factory New)|Industrial Grade|P250|0.14|0.08|91.00
MP9 | Dry Season (Factory New)|Consumer Grade|MP9|0.12|0.37|115.00
Sawed-Off | Mosaico (Factory New)|Industrial Grade|Sawed-Off|0.11|0.35|99.00
MAG-7 | Hazard (Factory New)|Mil-Spec|MAG-7|0.13|0.56|110.00
Negev | Palm (Factory New)|Industrial Grade|Negev|0.12|0.28|140.00
Tec-9 | Tornado (Factory New)|Consumer Grade|Tec-9|0.57|0.06|121.00
M249 | Jungle DDPAT (Factory New)|Consumer Grade|M249|0.15|0.28|81.00
SSG 08 | Mayan Dreams (Factory New)|Industrial Grade|SSG 08|0.10|0.26|81.00
Glock-18 | Sand Dune (Factory New)|Industrial Grade|Glock-18|0.11|0.28|173.00
USP-S | Overgrowth (Factory New)|Restricted|USP-S|0.20|0.43|127.00
AWP | Graphite (Factory New)|Classified|AWP|0.17|0.04|55.00
G3SG1 | Demeter (Factory New)|Mil-Spec|G3SG1|0.47|0.07|71.00
Galil AR | Shattered (Factory New)|Mil-Spec|Galil AR|0.12|0.07|123.00
SG 553 | Wave Spray (Factory New)|Mil-Spec|SG 553|0.55|0.19|103.00
AK-47 | Fire Serpent (Factory New)|Covert|AK-47|0.11|0.22|85.00
UMP-45 | Bone Pile (Factory New)|Mil-Spec|UMP-45|0.20|0.25|91.00
MAC-10 | Graven (Factory New)|Restricted|MAC-10|0.18|0.26|102.00
P2000 | Ocean Foam (Factory New)|Classified|P2000|0.55|0.08|85.00
Dual Berettas | Black Limba (Factory New)|Mil-Spec|Dual Berettas|0.09|0.24|80.00
M4A4 | Zirka (Factory New)|Restricted|M4A4|0.12|0.26|77.00
Desert Eagle | Golden Koi (Factory New)|Covert|Desert Eagle|0.16|0.15|119.00
P90 | Emerald Dragon (Factory New)|Classified|P90|0.19|0.17|95.00
Nova | Tempest (Factory New)|Mil-Spec|Nova|0.61|0.38|84.00
SSG 08 | Blood in the Water (Factory New)|Covert|SSG 08|0.13|0.07|69.00
USP-S | Serum (Factory New)|Classified|USP-S|0.07|0.28|54.00
M4A1-S | Blood Tiger (Factory New)|Mil-Spec|M4A1-S|0.07|0.26|72.00
MP9 | Hypnotic (Factory New)|Restricted|MP9|0.10|0.10|71.00
P90 | Cold Blooded (Factory New)|Classified|P90|0.01|0.45|82.00
Dual Berettas | Hemoglobin (Factory New)|Restricted|Dual Berettas|0.02|0.49|85.00
P250 | Hive (Factory New)|Mil-Spec|P250|0.04|0.60|81.00
Five-SeveN | Case Hardened (Factory New)|Restricted|Five-SeveN|0.25|0.05|74.00
FAMAS | Hexane (Factory New)|Mil-Spec|FAMAS|0.61|0.22|69.00
Tec-9 | Blue Titanium (Factory New)|Mil-Spec|Tec-9|0.50|0.06|71.00
Nova | Graphite (Factory New)|Restricted|Nova|0.42|0.05|44.00
SCAR-20 | Crimson Web (Factory New)|Mil-Spec|SCAR-20|0.02|0.36|69.00
G3SG1 | Desert Storm (Factory New)|Consumer Grade|G3SG1|0.08|0.27|94.00
P250 | Sand Dune (Factory New)|Consumer Grade|P250|0.12|0.27|187.00
Sawed-Off | Snake Camo (Factory New)|Industrial Grade|Sawed-Off|0.10|0.36|112.00
SG 553 | Damascus Steel (Factory New)|Mil-Spec|SG 553|0.17|0.03|72.00
AK-47 | Safari Mesh (Factory New)|Industrial Grade|AK-47|0.14|0.27|95.00
SCAR-20 | Sand Mesh (Factory New)|Consumer Grade|SCAR-20|0.11|0.33|84.00
Five-SeveN | Orange Peel (Factory New)|Industrial Grade|Five-SeveN|0.06|0.62|146.00
P2000 | Amber Fade (Factory New)|Restricted|P2000|0.11|0.33|78.00
P90 | Sand Spray (Factory New)|Consumer Grade|P90|0.11|0.36|98.00
MP9 | Sand Dashed (Factory New)|Consumer Grade|MP9|0.11|0.38|107.00
PP-Bizon | Brass (Factory New)|Mil-Spec|PP-Bizon|0.15|0.30|74.00
MAC-10 | Palm (Factory New)|Industrial Grade|MAC-10|0.12|0.26|163.00
Tec-9 | VariCamo (Factory New)|Industrial Grade|Tec-9|0.10|0.28|118.00
Nova | Predator (Factory New)|Consumer Grade|Nova|0.10|0.38|78.00
M4A1-S | VariCamo (Factory New)|Mil-Spec|M4A1-S|0.11|0.26|129.00
XM1014 | CaliCamo (Factory New)|Industrial Grade|XM1014|0.08|0.37|124.00
Tec-9 | Groundwater (Factory New)|Consumer Grade|Tec-9|0.18|0.25|134.00
Sawed-Off | Full Stop (Factory New)|Mil-Spec|Sawed-Off|0.03|0.44|70.00
AUG | Contractor (Factory New)|Consumer Grade|AUG|0.19|0.12|97.00
M4A1-S | Boreal Forest (Factory New)|Industrial Grade|M4A1-S|0.15|0.28|95.00
FAMAS | Colony (Factory New)|Consumer Grade|FAMAS|0.14|0.28|145.00
UMP-45 | Gunsmoke (Factory New)|Industrial Grade|UMP-45|0.09|0.16|111.00
Nova | Sand Dune (Factory New)|Consumer Grade|Nova|0.12|0.26|160.00
Glock-18 | Candy Apple (Factory New)|Mil-Spec|Glock-18|0.01|0.51|132.00
P2000 | Granite Marbleized (Factory New)|Industrial Grade|P2000|0.14|0.12|129.00
Dual Berettas | Stained (Factory New)|Industrial Grade|Dual Berettas|0.25|0.03|68.00
MP7 | Anodized Navy (Factory New)|Mil-Spec|MP7|0.58|0.14|71.00
PP-Bizon | Sand Dashed (Factory New)|Consumer Grade|PP-Bizon|0.11|0.35|101.00
Nova | Candy Apple (Factory New)|Industrial Grade|Nova|0.01|0.52|126.00
P250 | Boreal Forest (Factory New)|Consumer Grade|P250|0.17|0.27|96.00
USP-S | Night Ops (Factory New)|Mil-Spec|USP-S|0.44|0.03|86.00
Desert Eagle | Mudder (Factory New)|Industrial Grade|Desert Eagle|0.11|0.39|102.00
XM1014 | Blue Spruce (Factory New)|Consumer Grade|XM1014|0.41|0.19|143.00
AUG | Storm (Factory New)|Consumer Grade|AUG|0.46|0.06|134.00
AWP | Safari Mesh (Factory New)|Industrial Grade|AWP|0.14|0.18|85.00
Dual Berettas | Cobalt Quartz (Factory New)|Restricted|Dual Berettas|0.58|0.41|74.00
Galil AR | Sage Spray (Factory New)|Consumer Grade|Galil AR|0.13|0.19|151.00
PP-Bizon | Night Ops (Factory New)|Industrial Grade|PP-Bizon|0.56|0.08|76.00
P90 | Teardown (Factory New)|Mil-Spec|P90|0.70|0.21|70.00
SG 553 | Waves Perforated (Factory New)|Consumer Grade|SG 553|0.58|0.21|95.00
G3SG1 | Jungle Dashed (Factory New)|Consumer Grade|G3SG1|0.21|0.23|73.00
FAMAS | Cyanospatter (Factory New)|Industrial Grade|FAMAS|0.51|0.18|117.00
XM1014 | Blue Steel (Factory New)|Industrial Grade|XM1014|0.50|0.03|63.00
SG 553 | Anodized Navy (Factory New)|Mil-Spec|SG 553|0.50|0.05|62.00
P250 | Bone Mask (Factory New)|Consumer Grade|P250|0.15|0.19|123.00
Negev | CaliCamo (Factory New)|Industrial Grade|Negev|0.09|0.36|100.00
Five-SeveN | Contractor (Factory New)|Consumer Grade|Five-SeveN|0.12|0.26|136.00
AUG | Colony (Factory New)|Consumer Grade|AUG|0.14|0.23|127.00
MAG-7 | Bulldozer (Factory New)|Restricted|MAG-7|0.15|0.56|170.00
MAC-10 | Amber Fade (Factory New)|Mil-Spec|MAC-10|0.09|0.26|90.00
G3SG1 | Safari Mesh (Factory New)|Consumer Grade|G3SG1|0.14|0.25|91.00
SSG 08 | Tropical Storm (Factory New)|Industrial Grade|SSG 08|0.54|0.11|81.00
P90 | Scorched (Factory New)|Consumer Grade|P90|0.08|0.11|55.00
SG 553 | Gator Mesh (Factory New)|Industrial Grade|SG 553|0.18|0.45|77.00
Galil AR | Hunting Blind (Factory New)|Consumer Grade|Galil AR|0.10|0.47|95.00
Glock-18 | Groundwater (Factory New)|Industrial Grade|Glock-18|0.21|0.23|141.00
UMP-45 | Blaze (Factory New)|Mil-Spec|UMP-45|0.07|0.36|84.00
MP7 | Orange Peel (Factory New)|Industrial Grade|MP7|0.06|0.58|136.00
MP9 | Hot Rod (Factory New)|Mil-Spec|MP9|0.00|0.56|73.00
Dual Berettas | Contractor (Factory New)|Consumer Grade|Dual Berettas|0.27|0.12|81.00
SCAR-20 | Contractor (Factory New)|Consumer Grade|SCAR-20|0.15|0.16|85.00
G3SG1 | VariCamo (Factory New)|Industrial Grade|G3SG1|0.11|0.20|89.00
SSG 08 | Blue Spruce (Factory New)|Consumer Grade|SSG 08|0.40|0.15|103.00
SSG 08 | Acid Fade (Factory New)|Mil-Spec|SSG 08|0.21|0.18|65.00
M249 | Gator Mesh (Factory New)|Industrial Grade|M249|0.17|0.46|85.00
Galil AR | VariCamo (Factory New)|Industrial Grade|Galil AR|0.11|0.26|117.00
M4A1-S | Nitro (Factory New)|Restricted|M4A1-S|0.07|0.19|106.00
Tec-9 | Army Mesh (Factory New)|Consumer Grade|Tec-9|0.12|0.28|82.00
Five-SeveN | Silver Quartz (Factory New)|Mil-Spec|Five-SeveN|0.17|0.03|68.00
MP7 | Army Recon (Factory New)|Consumer Grade|MP7|0.10|0.38|97.00
USP-S | Forest Leaves (Factory New)|Industrial Grade|USP-S|0.15|0.40|80.00
AUG | Condemned (Factory New)|Industrial Grade|AUG|0.08|0.30|90.00
FAMAS | Teardown (Factory New)|Mil-Spec|FAMAS|0.70|0.31|78.00
MP9 | Orange Peel (Factory New)|Industrial Grade|MP9|0.06|0.57|125.00
UMP-45 | Urban DDPAT (Factory New)|Consumer Grade|UMP-45|0.15|0.07|108.00
P250 | Metallic DDPAT (Factory New)|Industrial Grade|P250|0.25|0.04|56.00
Dual Berettas | Colony (Factory New)|Consumer Grade|Dual Berettas|0.14|0.28|125.00
G3SG1 | Polar Camo (Factory New)|Consumer Grade|G3SG1|0.12|0.07|110.00
Desert Eagle | Urban Rubble (Factory New)|Mil-Spec|Desert Eagle|0.10|0.06|90.00
Tec-9 | Red Quartz (Factory New)|Restricted|Tec-9|0.08|0.18|67.00
Five-SeveN | Forest Night (Factory New)|Consumer Grade|Five-SeveN|0.55|0.18|119.00
MAG-7 | Metallic DDPAT (Factory New)|Industrial Grade|MAG-7|0.33|0.02|58.00
SCAR-20 | Carbon Fiber (Factory New)|Industrial Grade|SCAR-20|0.22|0.06|53.00
Sawed-Off | Amber Fade (Factory New)|Mil-Spec|Sawed-Off|0.07|0.36|87.00
Nova | Polar Mesh (Factory New)|Consumer Grade|Nova|0.13|0.09|115.00
P90 | Ash Wood (Factory New)|Industrial Grade|P90|0.13|0.12|112.00
PP-Bizon | Urban Dashed (Factory New)|Consumer Grade|PP-Bizon|0.15|0.07|107.00
MAC-10 | Candy Apple (Factory New)|Industrial Grade|MAC-10|0.01|0.46|137.00
M4A4 | Urban DDPAT (Factory New)|Industrial Grade|M4A4|0.13|0.08|130.00
Five-SeveN | Kami (Factory New)|Mil-Spec|Five-SeveN|0.13|0.15|119.00
M249 | Magma (Factory New)|Mil-Spec|M249|0.13|0.18|73.00
PP-Bizon | Cobalt Halftone (Factory New)|Mil-Spec|PP-Bizon|0.52|0.13|86.00
FAMAS | Pulse (Factory New)|Restricted|FAMAS|0.91|0.50|100.00
Dual Berettas | Marina (Factory New)|Restricted|Dual Berettas|0.10|0.67|127.00
MP9 | Rose Iron (Factory New)|Restricted|MP9|0.07|0.25|73.00
Nova | Rising Skull (Factory New)|Restricted|Nova|0.10|0.23|136.00
M4A1-S | Guardian (Factory New)|Classified|M4A1-S|0.55|0.19|85.00
P250 | Mehndi (Factory New)|Classified|P250|0.07|0.40|108.00
Galil AR | Blue Titanium (Factory New)|Mil-Spec|Galil AR|0.52|0.11|74.00
AK-47 | Blue Laminate (Factory New)|Restricted|AK-47|0.59|0.14|79.00
Desert Eagle | Cobalt Disruption (Factory New)|Classified|Desert Eagle|0.58|0.64|58.00
PP-Bizon | Water Sigil (Factory New)|Mil-Spec|PP-Bizon|0.61|0.23|84.00
Nova | Ghost Camo (Factory New)|Mil-Spec|Nova|0.80|0.07|70.00
AWP | Electric Hive (Factory New)|Classified|AWP|0.96|0.13|70.00
M4A4 | X-Ray (Factory New)|Covert|M4A4|0.83|0.03|100.00
G3SG1 | Azure Zebra (Factory New)|Mil-Spec|G3SG1|0.60|0.54|90.00
P250 | Steel Disruption (Factory New)|Mil-Spec|P250|0.55|0.13|76.00
P90 | Blind Spot (Factory New)|Restricted|P90|0.57|0.45|87.00
FAMAS | Afterimage (Factory New)|Classified|FAMAS|0.77|0.16|86.00
Five-SeveN | Nightshade (Factory New)|Mil-Spec|Five-SeveN|0.55|0.11|96.00
Sawed-Off | The Kraken (Factory New)|Covert|Sawed-Off|0.07|0.40|112.00
CZ75-Auto | Crimson Web (Factory New)|Mil-Spec|CZ75-Auto|0.03|0.27|77.00
P2000 | Red FragCam (Factory New)|Mil-Spec|P2000|0.00|0.49|94.00
Dual Berettas | Panther (Factory New)|Mil-Spec|Dual Berettas|0.03|0.33|91.00
USP-S | Stainless (Factory New)|Mil-Spec|USP-S|0.17|0.06|34.00
Glock-18 | Blue Fissure (Factory New)|Mil-Spec|Glock-18|0.68|0.20|92.00
CZ75-Auto | Tread Plate (Factory New)|Restricted|CZ75-Auto|0.17|0.06|70.00
Tec-9 | Titanium Bit (Factory New)|Restricted|Tec-9|0.56|0.09|65.00
Desert Eagle | Heirloom (Factory New)|Restricted|Desert Eagle|0.14|0.10|61.00
Five-SeveN | Copper Galaxy (Factory New)|Restricted|Five-SeveN|0.08|0.29|66.00
CZ75-Auto | The Fuschia Is Now (Factory New)|Classified|CZ75-Auto|0.96|0.16|86.00
P250 | Undertow (Factory New)|Classified|P250|0.53|0.36|75.00
CZ75-Auto | Victoria (Factory New)|Covert|CZ75-Auto|0.14|0.10|60.00
UMP-45 | Corporal (Factory New)|Mil-Spec|UMP-45|0.13|0.16|107.00
Negev | Terrain (Factory New)|Mil-Spec|Negev|0.43|0.31|74.00
MAG-7 | Heaven Guard (Factory New)|Mil-Spec|MAG-7|0.96|0.09|93.00
MAC-10 | Heat (Factory New)|Restricted|MAC-10|0.08|0.37|121.00
USP-S | Guardian (Factory New)|Restricted|USP-S|0.28|0.05|66.00
Nova | Antique (Factory New)|Classified|Nova|0.07|0.53|95.00
AUG | Chameleon (Factory New)|Covert|AUG|0.17|0.11|70.00
★ Gut Knife | Vanilla (Factory New)|Covert|Gut Knife|0.99|0.15|103.00
★ Gut Knife | Blue Steel (Factory New)|Covert|Gut Knife|0.99|0.19|79.00
★ Gut Knife | Boreal Forest (Factory New)|Covert|Gut Knife|0.18|0.17|118.00
★ Gut Knife | Case Hardened (Factory New)|Covert|Gut Knife|0.05|0.18|125.00
★ Gut Knife | Crimson Web (Factory New)|Covert|Gut Knife|0.01|0.38|115.00
★ Gut Knife | Fade (Factory New)|Covert|Gut Knife|0.02|0.45|129.00
★ Gut Knife | Forest DDPAT (Factory New)|Covert|Gut Knife|0.25|0.23|120.00
★ Gut Knife | Night (Factory New)|Covert|Gut Knife|0.56|0.19|91.00
★ Gut Knife | Safari Mesh (Factory New)|Covert|Gut Knife|0.20|0.16|118.00
★ Gut Knife | Scorched (Factory New)|Covert|Gut Knife|0.11|0.03|101.00
★ Gut Knife | Slaughter (Factory New)|Covert|Gut Knife|0.00|0.49|142.00
★ Gut Knife | Stained (Factory New)|Covert|Gut Knife|0.00|0.15|110.00
★ Gut Knife | Urban Masked (Factory New)|Covert|Gut Knife|0.48|0.04|159.00
★ Flip Knife | Vanilla (Factory New)|Covert|Flip Knife|0.42|0.02|91.00
★ Flip Knife | Blue Steel (Factory New)|Covert|Flip Knife|0.47|0.10|61.00
★ Flip Knife | Boreal Forest (Factory New)|Covert|Flip Knife|0.17|0.18|104.00
★ Flip Knife | Case Hardened (Factory New)|Covert|Flip Knife|0.17|0.19|103.00
★ Flip Knife | Crimson Web (Factory New)|Covert|Flip Knife|0.01|0.39|99.00
★ Flip Knife | Fade (Factory New)|Covert|Flip Knife|0.05|0.26|92.00
★ Flip Knife | Forest DDPAT (Factory New)|Covert|Flip Knife|0.22|0.23|105.00
★ Flip Knife | Night (Factory New)|Covert|Flip Knife|0.55|0.14|80.00
★ Flip Knife | Safari Mesh (Factory New)|Covert|Flip Knife|0.17|0.19|107.00
★ Flip Knife | Scorched (Factory New)|Covert|Flip Knife|0.08|0.06|70.00
★ Flip Knife | Slaughter (Factory New)|Covert|Flip Knife|0.02|0.36|104.00
★ Flip Knife | Stained (Factory New)|Covert|Flip Knife|0.37|0.06|84.00
★ Flip Knife | Urban Masked (Factory New)|Covert|Flip Knife|0.29|0.03|155.00
★ Bayonet | Vanilla (Factory New)|Covert|Bayonet|0.54|0.05|164.00
★ Bayonet | Blue Steel (Factory New)|Covert|Bayonet|0.44|0.10|81.00
★ Bayonet | Boreal Forest (Factory New)|Covert|Bayonet|0.18|0.20|117.00
★ Bayonet | Case Hardened (Factory New)|Covert|Bayonet|0.19|0.16|139.00
★ Bayonet | Crimson Web (Factory New)|Covert|Bayonet|0.00|0.45|124.00
★ Bayonet | Fade (Factory New)|Covert|Bayonet|0.06|0.28|122.00
★ Bayonet | Forest DDPAT (Factory New)|Covert|Bayonet|0.21|0.22|122.00
★ Bayonet | Night (Factory New)|Covert|Bayonet|0.55|0.15|89.00
★ Bayonet | Safari Mesh (Factory New)|Covert|Bayonet|0.18|0.19|122.00
★ Bayonet | Scorched (Factory New)|Covert|Bayonet|0.11|0.03|89.00
★ Bayonet | Slaughter (Factory New)|Covert|Bayonet|0.02|0.41|142.00
★ Bayonet | Stained (Factory New)|Covert|Bayonet|0.33|0.05|113.00
★ Bayonet | Urban Masked (Factory New)|Covert|Bayonet|0.37|0.03|167.00
★ M9 Bayonet | Vanilla (Factory New)|Covert|M9 Bayonet|0.56|0.12|101.00
★ M9 Bayonet | Blue Steel (Factory New)|Covert|M9 Bayonet|0.59|0.21|61.00
★ M9 Bayonet | Boreal Forest (Factory New)|Covert|M9 Bayonet|0.19|0.18|109.00
★ M9 Bayonet | Case Hardened (Factory New)|Covert|M9 Bayonet|0.14|0.16|109.00
★ M9 Bayonet | Crimson Web (Factory New)|Covert|M9 Bayonet|0.00|0.46|118.00
★ M9 Bayonet | Fade (Factory New)|Covert|M9 Bayonet|0.02|0.29|104.00
★ M9 Bayonet | Forest DDPAT (Factory New)|Covert|M9 Bayonet|0.23|0.22|116.00
★ M9 Bayonet | Night (Factory New)|Covert|M9 Bayonet|0.57|0.18|84.00
★ M9 Bayonet | Safari Mesh (Factory New)|Covert|M9 Bayonet|0.19|0.18|114.00
★ M9 Bayonet | Scorched (Factory New)|Covert|M9 Bayonet|0.11|0.04|85.00
★ M9 Bayonet | Slaughter (Factory New)|Covert|M9 Bayonet|0.99|0.43|119.00
★ M9 Bayonet | Stained (Factory New)|Covert|M9 Bayonet|0.56|0.10|91.00
★ M9 Bayonet | Urban Masked (Factory New)|Covert|M9 Bayonet|0.47|0.04|148.00
★ Karambit | Vanilla (Factory New)|Covert|Karambit|0.58|0.04|54.00
★ Karambit | Blue Steel (Factory New)|Covert|Karambit|0.56|0.13|111.00
★ Karambit | Boreal Forest (Factory New)|Covert|Karambit|0.32|0.19|111.00
★ Karambit | Case Hardened (Factory New)|Covert|Karambit|0.26|0.05|128.00
★ Karambit | Crimson Web (Factory New)|Covert|Karambit|0.01|0.25|103.00
★ Karambit | Fade (Factory New)|Covert|Karambit|0.88|0.13|118.00
★ Karambit | Forest DDPAT (Factory New)|Covert|Karambit|0.18|0.16|100.00
★ Karambit | Night (Factory New)|Covert|Karambit|0.57|0.09|77.00
★ Karambit | Safari Mesh (Factory New)|Covert|Karambit|0.20|0.17|117.00
★ Karambit | Scorched (Factory New)|Covert|Karambit|0.08|0.03|127.00
★ Karambit | Slaughter (Factory New)|Covert|Karambit|0.99|0.21|131.00
★ Karambit | Stained (Factory New)|Covert|Karambit|0.56|0.07|110.00
★ Karambit | Urban Masked (Factory New)|Covert|Karambit|0.48|0.04|156.00
Tec-9 | Isaac (Factory New)|Mil-Spec|Tec-9|0.02|0.29|79.00
Dual Berettas | Retribution (Factory New)|Mil-Spec|Dual Berettas|0.16|0.29|78.00
Galil AR | Kami (Factory New)|Mil-Spec|Galil AR|0.13|0.15|136.00
P90 | Desert Warfare (Factory New)|Mil-Spec|P90|0.14|0.24|86.00
CZ75-Auto | Poison Dart (Factory New)|Mil-Spec|CZ75-Auto|0.25|0.04|57.00
AUG | Torque (Factory New)|Restricted|AUG|0.15|0.12|78.00
PP-Bizon | Antique (Factory New)|Restricted|PP-Bizon|0.08|0.43|84.00
MAC-10 | Curse (Factory New)|Restricted|MAC-10|0.07|0.30|131.00
XM1014 | Heaven Guard (Factory New)|Restricted|XM1014|0.98|0.15|108.00
M4A1-S | Atomic Alloy (Factory New)|Classified|M4A1-S|0.04|0.53|57.00
SCAR-20 | Cyrex (Factory New)|Classified|SCAR-20|0.07|0.14|74.00
USP-S | Orion (Factory New)|Classified|USP-S|0.09|0.42|91.00
AK-47 | Vulcan (Factory New)|Covert|AK-47|0.29|0.04|92.00
M4A4 | Howl (Factory New)|Contraband|M4A4|0.03|0.49|109.00
P250 | Franklin (Factory New)|Classified|P250|0.16|0.13|135.00
AK-47 | Emerald Pinstripe (Factory New)|Restricted|AK-47|0.17|0.07|67.00
CZ75-Auto | Tuxedo (Factory New)|Mil-Spec|CZ75-Auto|0.15|0.15|106.00
Desert Eagle | Meteorite (Factory New)|Mil-Spec|Desert Eagle|0.10|0.24|34.00
G3SG1 | Green Apple (Factory New)|Industrial Grade|G3SG1|0.27|0.34|99.00
Galil AR | Tuxedo (Factory New)|Mil-Spec|Galil AR|0.14|0.12|116.00
MAC-10 | Silver (Factory New)|Industrial Grade|MAC-10|0.14|0.07|97.00
MP7 | Forest DDPAT (Factory New)|Consumer Grade|MP7|0.15|0.28|101.00
Negev | Army Sheen (Factory New)|Consumer Grade|Negev|0.17|0.12|68.00
Nova | Caged Steel (Factory New)|Industrial Grade|Nova|0.33|0.04|50.00
Sawed-Off | Forest DDPAT (Factory New)|Consumer Grade|Sawed-Off|0.17|0.26|87.00
SG 553 | Army Sheen (Factory New)|Consumer Grade|SG 553|0.14|0.09|74.00
Tec-9 | Urban DDPAT (Factory New)|Consumer Grade|Tec-9|0.11|0.08|112.00
UMP-45 | Carbon Fiber (Factory New)|Industrial Grade|UMP-45|0.17|0.05|63.00
★ Huntsman Knife | Vanilla (Factory New)|Covert|Huntsman Knife|0.61|0.05|60.00
★ Huntsman Knife | Blue Steel (Factory New)|Covert|Huntsman Knife|0.57|0.23|109.00
★ Huntsman Knife | Boreal Forest (Factory New)|Covert|Huntsman Knife|0.22|0.15|88.00
★ Huntsman Knife | Case Hardened (Factory New)|Covert|Huntsman Knife|0.52|0.06|129.00
★ Huntsman Knife | Crimson Web (Factory New)|Covert|Huntsman Knife|0.00|0.40|108.00
★ Huntsman Knife | Fade (Factory New)|Covert|Huntsman Knife|0.10|0.30|148.00
★ Huntsman Knife | Forest DDPAT (Factory New)|Covert|Huntsman Knife|0.18|0.15|93.00
★ Huntsman Knife | Night (Factory New)|Covert|Huntsman Knife|0.56|0.12|67.00
★ Huntsman Knife | Safari Mesh (Factory New)|Covert|Huntsman Knife|0.19|0.14|93.00
★ Huntsman Knife | Scorched (Factory New)|Covert|Huntsman Knife|0.17|0.02|112.00
★ Huntsman Knife | Slaughter (Factory New)|Covert|Huntsman Knife|0.99|0.34|151.00
★ Huntsman Knife | Stained (Factory New)|Covert|Huntsman Knife|0.57|0.12|120.00
★ Huntsman Knife | Urban Masked (Factory New)|Covert|Huntsman Knife|0.50|0.03|115.00
CZ75-Auto | Twist (Factory New)|Mil-Spec|CZ75-Auto|0.21|0.05|83.00
P90 | Module (Factory New)|Mil-Spec|P90|0.52|0.45|78.00
P2000 | Pulse (Factory New)|Mil-Spec|P2000|0.35|0.30|99.00
MAC-10 | Tatter (Factory New)|Restricted|MAC-10|0.08|0.23|105.00
USP-S | Caiman (Factory New)|Classified|USP-S|0.06|0.22|69.00
M4A4 | Desert-Strike (Factory New)|Covert|M4A4|0.11|0.24|93.00
M4A1-S | Cyrex (Factory New)|Covert|M4A1-S|0.02|0.27|90.00
MP7 | Urban Hazard (Factory New)|Mil-Spec|MP7|0.08|0.27|88.00
Negev | Desert-Strike (Factory New)|Mil-Spec|Negev|0.12|0.26|94.00
Nova | Koi (Factory New)|Restricted|Nova|0.05|0.29|122.00
P250 | Supernova (Factory New)|Restricted|P250|0.08|0.23|73.00
SSG 08 | Abyss (Factory New)|Mil-Spec|SSG 08|0.55|0.17|63.00
UMP-45 | Labyrinth (Factory New)|Mil-Spec|UMP-45|0.14|0.13|127.00
PP-Bizon | Osiris (Factory New)|Restricted|PP-Bizon|0.10|0.31|88.00
CZ75-Auto | Tigris (Factory New)|Restricted|CZ75-Auto|0.07|0.51|92.00
Desert Eagle | Conspiracy (Factory New)|Classified|Desert Eagle|0.10|0.17|88.00
Five-SeveN | Fowl Play (Factory New)|Classified|Five-SeveN|0.27|0.07|86.00
Glock-18 | Water Elemental (Factory New)|Classified|Glock-18|0.97|0.35|72.00
P2000 | Ivory (Factory New)|Mil-Spec|P2000|0.12|0.06|178.00
P90 | Asiimov (Factory New)|Covert|P90|0.09|0.16|183.00
P90 | Leather (Factory New)|Industrial Grade|P90|0.13|0.09|92.00
MAC-10 | Commuter (Factory New)|Industrial Grade|MAC-10|0.11|0.14|111.00
Sawed-Off | First Class (Factory New)|Mil-Spec|Sawed-Off|0.12|0.13|118.00
P2000 | Coach Class (Factory New)|Industrial Grade|P2000|0.41|0.06|74.00
USP-S | Business Class (Factory New)|Mil-Spec|USP-S|0.49|0.11|79.00
G3SG1 | Contractor (Factory New)|Consumer Grade|G3SG1|0.13|0.15|97.00
MP7 | Olive Plaid (Factory New)|Consumer Grade|MP7|0.10|0.31|84.00
CZ75-Auto | Green Plaid (Factory New)|Consumer Grade|CZ75-Auto|0.14|0.22|101.00
MP9 | Green Plaid (Factory New)|Consumer Grade|MP9|0.11|0.28|118.00
SSG 08 | Sand Dune (Factory New)|Consumer Grade|SSG 08|0.10|0.22|108.00
SG 553 | Traveler (Factory New)|Industrial Grade|SG 553|0.19|0.04|73.00
XM1014 | Red Leather (Factory New)|Mil-Spec|XM1014|0.01|0.44|84.00
Desert Eagle | Pilot (Factory New)|Restricted|Desert Eagle|0.12|0.13|98.00
AK-47 | Jet Set (Factory New)|Classified|AK-47|0.57|0.19|87.00
AK-47 | First Class (Factory New)|Restricted|AK-47|0.12|0.25|115.00
AWP | Dragon Lore (Factory New)|Covert|AWP|0.11|0.26|136.00
P90 | Storm (Factory New)|Consumer Grade|P90|0.47|0.04|162.00
UMP-45 | Indigo (Factory New)|Consumer Grade|UMP-45|0.57|0.13|118.00
MAC-10 | Indigo (Factory New)|Consumer Grade|MAC-10|0.55|0.14|119.00
SCAR-20 | Storm (Factory New)|Consumer Grade|SCAR-20|0.48|0.04|98.00
USP-S | Royal Blue (Factory New)|Industrial Grade|USP-S|0.63|0.39|79.00
Dual Berettas | Briar (Factory New)|Consumer Grade|Dual Berettas|0.17|0.40|79.00
Nova | Green Apple (Factory New)|Industrial Grade|Nova|0.27|0.32|107.00
MAG-7 | Silver (Factory New)|Industrial Grade|MAG-7|0.12|0.06|106.00
MP9 | Dark Age (Factory New)|Mil-Spec|MP9|0.11|0.17|79.00
Desert Eagle | Hand Cannon (Factory New)|Restricted|Desert Eagle|0.07|0.39|96.00
P2000 | Chainmail (Factory New)|Mil-Spec|P2000|0.14|0.11|89.00
Sawed-Off | Rust Coat (Factory New)|Industrial Grade|Sawed-Off|0.05|0.52|79.00
M4A1-S | Knight (Factory New)|Classified|M4A1-S|0.55|0.04|80.00
CZ75-Auto | Chalice (Factory New)|Restricted|CZ75-Auto|0.07|0.44|107.00
M4A1-S | Master Piece (Factory New)|Classified|M4A1-S|0.10|0.31|120.00
Desert Eagle | Urban DDPAT (Factory New)|Industrial Grade|Desert Eagle|0.14|0.08|93.00
MP7 | Gunsmoke (Factory New)|Industrial Grade|MP7|0.06|0.47|100.00
Glock-18 | Night (Factory New)|Industrial Grade|Glock-18|0.55|0.07|78.00
P2000 | Grassland (Factory New)|Industrial Grade|P2000|0.08|0.39|112.00
CZ75-Auto | Nitro (Factory New)|Mil-Spec|CZ75-Auto|0.12|0.22|115.00
Sawed-Off | Sage Spray (Factory New)|Consumer Grade|Sawed-Off|0.14|0.08|177.00
UMP-45 | Scorched (Factory New)|Consumer Grade|UMP-45|0.08|0.11|102.00
M249 | Contrast Spray (Factory New)|Consumer Grade|M249|0.14|0.05|156.00
MAG-7 | Storm (Factory New)|Consumer Grade|MAG-7|0.46|0.04|128.00
MP9 | Storm (Factory New)|Consumer Grade|MP9|0.46|0.03|162.00
XM1014 | VariCamo Blue (Factory New)|Mil-Spec|XM1014|0.55|0.03|115.00
AWP | Pink DDPAT (Factory New)|Restricted|AWP|0.97|0.05|95.00
USP-S | Road Rash (Factory New)|Restricted|USP-S|0.14|0.14|100.00`;

export const dominantSkins: Skin[] = parseRawData(DOMINANT_RAW);
export const averageSkins: Skin[] = parseRawData(AVERAGE_RAW);
export const weightedSkins: Skin[] = parseRawData(WEIGHTED_RAW);

// Get all unique weapon types across all datasets
export function getAllWeaponTypes(skins: Skin[]): string[] {
  const types = new Set(skins.map((s) => s.weapon));
  return Array.from(types).sort();
}

// HSV to RGB conversion (h: 0-1, s: 0-1, v: 0-1)
export function hsvToRgb(
  h: number,
  s: number,
  v: number
): [number, number, number] {
  let r = 0,
    g = 0,
    b = 0;
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
      break;
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

export function skinToColor(skin: Skin): string {
  const [r, g, b] = hsvToRgb(skin.hue, skin.saturation, skin.value);
  return `rgb(${r},${g},${b})`;
}

// Find similar skins based on HSV distance
export function findSimilarSkins(skin: Skin, allSkins: Skin[], count = 12): Skin[] {
  return allSkins
    .filter((s) => s.id !== skin.id)
    .map((s) => {
      const dh = Math.min(Math.abs(s.hue - skin.hue), 1 - Math.abs(s.hue - skin.hue));
      const ds = Math.abs(s.saturation - skin.saturation);
      const dv = Math.abs(s.value - skin.value);
      const dist = Math.sqrt(dh * dh + ds * ds * 0.5 + dv * dv * 0.5);
      return { skin: s, dist };
    })
    .sort((a, b) => a.dist - b.dist)
    .slice(0, count)
    .map((x) => x.skin);
}

export const RARITY_COLORS: Record<string, string> = {
  "Consumer Grade": "#b0c3d9",
  "Industrial Grade": "#5e98d9",
  "Mil-Spec": "#4b69ff",
  Restricted: "#8847ff",
  Classified: "#d32ce6",
  Covert: "#eb4b4b",
  Contraband: "#e4ae39",
};
