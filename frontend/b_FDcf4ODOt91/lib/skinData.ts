export interface Skin {
  id: string;
  imageId: string;
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
    // Expected: weapon | skin (cond) | rarity | id | weapon | hue | sat | value
    if (parts.length < 8) continue;
    const weaponType = parts[0].trim();
    if (weaponType.toLowerCase().startsWith("souvenir ")) continue;
    const skinNameRaw = parts[1].trim();
    const rarity = parts[2].trim();
    const stableId = parts[3].trim();
    // parts[4] is redundant weapon type, skip it
    const hue = parseFloat(parts[5].trim());
    const saturation = parseFloat(parts[6].trim());
    const value = parseFloat(parts[7].trim());

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

    const idBase = stableId ? `${stableId}-${weaponType}-${skinName}` : `${weaponType}-${skinName}`;

    skins.push({
      id: idBase.replace(/[^a-zA-Z0-9-]/g, "_"),
      imageId: stableId,
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
const DOMINANT_RAW = `UMP-45 | Caramel (Factory New)|Consumer Grade|1|UMP-45|0.09|0.11|84.00
AUG | Hot Rod (Factory New)|Mil-Spec|2|AUG|0.00|0.84|44.00
Glock-18 | Fade (Factory New)|Restricted|3|Glock-18|0.08|0.78|59.00
MP9 | Bulldozer (Factory New)|Restricted|4|MP9|0.15|0.75|255.00
SG 553 | Tornado (Factory New)|Consumer Grade|5|SG 553|0.61|0.24|38.00
Negev | Anodized Navy (Factory New)|Mil-Spec|6|Negev|0.10|0.10|71.00
Five-SeveN | Candy Apple (Factory New)|Industrial Grade|7|Five-SeveN|0.15|0.11|80.00
FAMAS | Contrast Spray (Factory New)|Consumer Grade|8|FAMAS|0.17|0.02|255.00
M249 | Blizzard Marbleized (Factory New)|Industrial Grade|9|M249|0.06|0.28|81.00
MP7 | Whiteout (Factory New)|Mil-Spec|10|MP7|0.17|0.00|255.00
P2000 | Silver (Factory New)|Mil-Spec|11|P2000|0.15|0.11|84.00
G3SG1 | Arctic Camo (Factory New)|Industrial Grade|12|G3SG1|0.17|0.02|255.00
Galil AR | Winter Forest (Factory New)|Industrial Grade|13|Galil AR|0.12|0.10|123.00
XM1014 | Fallout Warning (Factory New)|Industrial Grade|14|XM1014|0.65|0.11|80.00
Souvenir XM1014 | Fallout Warning (Factory New)|Industrial Grade|14|XM1014|0.65|0.11|80.00
M4A4 | Radiation Hazard (Factory New)|Mil-Spec|15|M4A4|0.00|0.20|5.00
Souvenir M4A4 | Radiation Hazard (Factory New)|Mil-Spec|15|M4A4|0.00|0.20|5.00
UMP-45 | Fallout Warning (Factory New)|Industrial Grade|16|UMP-45|0.10|0.11|64.00
Souvenir UMP-45 | Fallout Warning (Factory New)|Industrial Grade|16|UMP-45|0.10|0.11|64.00
PP-Bizon | Irradiated Alert (Factory New)|Consumer Grade|17|PP-Bizon|0.09|0.37|63.00
Souvenir PP-Bizon | Irradiated Alert (Factory New)|Consumer Grade|17|PP-Bizon|0.09|0.37|63.00
P90 | Fallout Warning (Factory New)|Industrial Grade|18|P90|0.62|0.05|82.00
Souvenir P90 | Fallout Warning (Factory New)|Industrial Grade|18|P90|0.62|0.05|82.00
Tec-9 | Nuclear Threat (Factory New)|Restricted|19|Tec-9|0.28|0.31|77.00
Souvenir Tec-9 | Nuclear Threat (Factory New)|Restricted|19|Tec-9|0.28|0.31|77.00
P250 | Nuclear Threat (Factory New)|Restricted|20|P250|0.29|0.31|70.00
Souvenir P250 | Nuclear Threat (Factory New)|Restricted|20|P250|0.29|0.31|70.00
Sawed-Off | Irradiated Alert (Factory New)|Consumer Grade|21|Sawed-Off|0.12|0.37|62.00
Souvenir Sawed-Off | Irradiated Alert (Factory New)|Consumer Grade|21|Sawed-Off|0.12|0.37|62.00
MAG-7 | Irradiated Alert (Factory New)|Consumer Grade|22|MAG-7|0.48|0.13|85.00
Souvenir MAG-7 | Irradiated Alert (Factory New)|Consumer Grade|22|MAG-7|0.48|0.13|85.00
SCAR-20 | Splash Jam (Factory New)|Classified|23|SCAR-20|0.08|0.11|55.00
Nova | Modern Hunter (Factory New)|Mil-Spec|24|Nova|0.11|0.11|53.00
PP-Bizon | Forest Leaves (Factory New)|Consumer Grade|25|PP-Bizon|0.13|0.58|112.00
PP-Bizon | Modern Hunter (Factory New)|Mil-Spec|26|PP-Bizon|0.11|0.11|53.00
XM1014 | Blaze Orange (Factory New)|Mil-Spec|27|XM1014|0.09|0.54|139.00
P250 | Modern Hunter (Factory New)|Mil-Spec|28|P250|0.13|0.22|167.00
MAC-10 | Tornado (Factory New)|Consumer Grade|29|MAC-10|0.10|0.31|189.00
Nova | Blaze Orange (Factory New)|Mil-Spec|30|Nova|0.10|0.11|46.00
XM1014 | Grassland (Factory New)|Consumer Grade|31|XM1014|0.10|0.41|61.00
P2000 | Grassland Leaves (Factory New)|Industrial Grade|32|P2000|0.17|0.21|94.00
M4A4 | Modern Hunter (Factory New)|Restricted|33|M4A4|0.14|0.22|172.00
Nova | Walnut (Factory New)|Consumer Grade|34|Nova|0.58|0.03|65.00
Souvenir Nova | Walnut (Factory New)|Consumer Grade|34|Nova|0.58|0.03|65.00
M4A4 | Tornado (Factory New)|Industrial Grade|35|M4A4|0.60|0.21|132.00
Souvenir M4A4 | Tornado (Factory New)|Industrial Grade|35|M4A4|0.60|0.21|132.00
Tec-9 | Brass (Factory New)|Mil-Spec|36|Tec-9|0.50|0.04|56.00
Souvenir Tec-9 | Brass (Factory New)|Mil-Spec|36|Tec-9|0.50|0.04|56.00
P250 | Gunsmoke (Factory New)|Industrial Grade|37|P250|0.11|0.14|210.00
Souvenir P250 | Gunsmoke (Factory New)|Industrial Grade|37|P250|0.11|0.14|210.00
Dual Berettas | Anodized Navy (Factory New)|Mil-Spec|38|Dual Berettas|0.00|0.00|30.00
Souvenir Dual Berettas | Anodized Navy (Factory New)|Mil-Spec|38|Dual Berettas|0.00|0.00|30.00
MAG-7 | Sand Dune (Factory New)|Consumer Grade|39|MAG-7|0.17|0.02|255.00
Souvenir MAG-7 | Sand Dune (Factory New)|Consumer Grade|39|MAG-7|0.17|0.02|255.00
AK-47 | Black Laminate (Factory New)|Mil-Spec|40|AK-47|0.17|0.08|61.00
Souvenir AK-47 | Black Laminate (Factory New)|Mil-Spec|40|AK-47|0.17|0.08|61.00
PP-Bizon | Carbon Fiber (Factory New)|Industrial Grade|41|PP-Bizon|0.17|0.06|16.00
Souvenir PP-Bizon | Carbon Fiber (Factory New)|Industrial Grade|41|PP-Bizon|0.17|0.06|16.00
MAC-10 | Urban DDPAT (Factory New)|Consumer Grade|42|MAC-10|0.07|0.10|67.00
Souvenir MAC-10 | Urban DDPAT (Factory New)|Consumer Grade|42|MAC-10|0.07|0.10|67.00
P90 | Glacier Mesh (Factory New)|Mil-Spec|43|P90|0.50|0.04|255.00
Souvenir P90 | Glacier Mesh (Factory New)|Mil-Spec|43|P90|0.50|0.04|255.00
XM1014 | Urban Perforated (Factory New)|Consumer Grade|45|XM1014|0.17|0.10|20.00
Souvenir XM1014 | Urban Perforated (Factory New)|Consumer Grade|45|XM1014|0.17|0.10|20.00
M4A4 | Jungle Tiger (Factory New)|Industrial Grade|46|M4A4|0.99|0.22|96.00
SSG 08 | Lichen Dashed (Factory New)|Consumer Grade|47|SSG 08|0.10|0.07|70.00
Five-SeveN | Jungle (Factory New)|Consumer Grade|48|Five-SeveN|0.35|0.36|147.00
Tec-9 | Ossified (Factory New)|Mil-Spec|49|Tec-9|0.50|0.04|56.00
Nova | Forest Leaves (Factory New)|Consumer Grade|50|Nova|0.21|0.39|18.00
AK-47 | Jungle Spray (Factory New)|Industrial Grade|51|AK-47|0.17|0.03|39.00
AK-47 | Predator (Factory New)|Industrial Grade|52|AK-47|0.11|0.45|65.00
SCAR-20 | Palm (Factory New)|Industrial Grade|53|SCAR-20|0.08|0.09|69.00
Sawed-Off | Copper (Factory New)|Mil-Spec|54|Sawed-Off|0.06|0.69|52.00
M4A4 | Desert Storm (Factory New)|Industrial Grade|55|M4A4|0.10|0.35|194.00
Glock-18 | Brass (Factory New)|Restricted|57|Glock-18|0.19|0.12|73.00
P2000 | Scorpion (Factory New)|Restricted|58|P2000|0.10|0.10|67.00
Desert Eagle | Blaze (Factory New)|Restricted|59|Desert Eagle|0.08|0.09|23.00
AWP | Snake Camo (Factory New)|Mil-Spec|60|AWP|0.08|0.10|20.00
AWP | BOOM (Factory New)|Classified|62|AWP|0.08|0.09|64.00
MAG-7 | Memento (Factory New)|Mil-Spec|63|MAG-7|0.08|0.26|54.00
Galil AR | Orange DDPAT (Factory New)|Restricted|64|Galil AR|0.13|0.26|58.00
P250 | Splash (Factory New)|Restricted|66|P250|0.08|0.25|64.00
Sawed-Off | Orange DDPAT (Factory New)|Restricted|67|Sawed-Off|0.14|0.23|74.00
M4A4 | Faded Zebra (Factory New)|Mil-Spec|68|M4A4|0.00|0.00|13.00
AK-47 | Red Laminate (Factory New)|Classified|69|AK-47|0.17|0.08|61.00
AWP | Lightning Strike (Factory New)|Covert|70|AWP|0.17|0.09|33.00
AUG | Wings (Factory New)|Mil-Spec|71|AUG|0.17|0.12|16.00
SG 553 | Ultraviolet (Factory New)|Mil-Spec|72|SG 553|0.17|0.11|47.00
AK-47 | Case Hardened (Factory New)|Classified|73|AK-47|0.08|0.05|40.00
Desert Eagle | Hypnotic (Factory New)|Classified|74|Desert Eagle|0.17|0.09|22.00
Glock-18 | Dragon Tattoo (Factory New)|Restricted|75|Glock-18|0.00|0.00|47.00
SCAR-20 | Emerald (Factory New)|Restricted|79|SCAR-20|0.40|0.83|42.00
MP7 | Groundwater (Factory New)|Consumer Grade|80|MP7|0.15|0.35|102.00
AUG | Anodized Navy (Factory New)|Mil-Spec|81|AUG|0.59|0.44|34.00
FAMAS | Spitfire (Factory New)|Restricted|82|FAMAS|0.15|0.39|95.00
PP-Bizon | Rust Coat (Factory New)|Mil-Spec|83|PP-Bizon|0.07|0.08|59.00
XM1014 | Jungle (Factory New)|Consumer Grade|84|XM1014|0.38|0.39|41.00
Five-SeveN | Anodized Gunmetal (Factory New)|Consumer Grade|85|Five-SeveN|0.17|0.06|17.00
P250 | Facets (Factory New)|Industrial Grade|86|P250|0.10|0.11|75.00
MP9 | Dry Season (Factory New)|Consumer Grade|87|MP9|0.10|0.31|131.00
Sawed-Off | Mosaico (Factory New)|Industrial Grade|88|Sawed-Off|0.09|0.59|22.00
MAG-7 | Hazard (Factory New)|Mil-Spec|89|MAG-7|0.11|0.11|56.00
Negev | Palm (Factory New)|Industrial Grade|90|Negev|0.17|0.18|255.00
Tec-9 | Tornado (Factory New)|Consumer Grade|91|Tec-9|0.60|0.21|141.00
M249 | Jungle DDPAT (Factory New)|Consumer Grade|92|M249|0.17|0.58|31.00
SSG 08 | Mayan Dreams (Factory New)|Industrial Grade|93|SSG 08|0.09|0.46|123.00
Glock-18 | Sand Dune (Factory New)|Industrial Grade|94|Glock-18|0.11|0.31|197.00
USP-S | Overgrowth (Factory New)|Restricted|95|USP-S|0.36|0.43|129.00
AWP | Graphite (Factory New)|Classified|96|AWP|0.08|0.06|31.00
G3SG1 | Demeter (Factory New)|Mil-Spec|97|G3SG1|0.42|0.06|66.00
Galil AR | Shattered (Factory New)|Mil-Spec|98|Galil AR|0.10|0.11|63.00
SG 553 | Wave Spray (Factory New)|Mil-Spec|99|SG 553|0.40|0.10|136.00
AK-47 | Fire Serpent (Factory New)|Covert|100|AK-47|0.13|0.08|65.00
UMP-45 | Bone Pile (Factory New)|Mil-Spec|101|UMP-45|0.20|0.43|72.00
MAC-10 | Graven (Factory New)|Restricted|102|MAC-10|0.09|0.11|84.00
P2000 | Ocean Foam (Factory New)|Classified|103|P2000|0.10|0.10|67.00
Dual Berettas | Black Limba (Factory New)|Mil-Spec|104|Dual Berettas|0.10|0.11|72.00
M4A4 | Zirka (Factory New)|Restricted|105|M4A4|0.10|0.35|77.00
Desert Eagle | Golden Koi (Factory New)|Covert|106|Desert Eagle|0.16|0.20|85.00
P90 | Emerald Dragon (Factory New)|Classified|107|P90|0.18|0.11|87.00
Nova | Tempest (Factory New)|Mil-Spec|108|Nova|0.64|0.20|56.00
SSG 08 | Blood in the Water (Factory New)|Covert|110|SSG 08|0.17|0.07|15.00
USP-S | Serum (Factory New)|Classified|111|USP-S|0.17|0.06|17.00
M4A1-S | Blood Tiger (Factory New)|Mil-Spec|112|M4A1-S|0.10|0.12|57.00
MP9 | Hypnotic (Factory New)|Restricted|113|MP9|0.17|0.04|24.00
P90 | Cold Blooded (Factory New)|Classified|114|P90|0.00|0.06|16.00
Dual Berettas | Hemoglobin (Factory New)|Restricted|115|Dual Berettas|0.00|0.83|46.00
P250 | Hive (Factory New)|Mil-Spec|116|P250|0.06|0.90|73.00
Five-SeveN | Case Hardened (Factory New)|Restricted|117|Five-SeveN|0.23|0.09|58.00
FAMAS | Hexane (Factory New)|Mil-Spec|118|FAMAS|0.58|0.41|59.00
Tec-9 | Blue Titanium (Factory New)|Mil-Spec|119|Tec-9|0.18|0.11|90.00
Nova | Graphite (Factory New)|Restricted|120|Nova|0.08|0.09|23.00
SCAR-20 | Crimson Web (Factory New)|Mil-Spec|121|SCAR-20|0.08|0.11|55.00
G3SG1 | Desert Storm (Factory New)|Consumer Grade|122|G3SG1|0.06|0.53|103.00
Souvenir G3SG1 | Desert Storm (Factory New)|Consumer Grade|122|G3SG1|0.06|0.53|103.00
P250 | Sand Dune (Factory New)|Consumer Grade|123|P250|0.11|0.31|201.00
Souvenir P250 | Sand Dune (Factory New)|Consumer Grade|123|P250|0.11|0.31|201.00
Sawed-Off | Snake Camo (Factory New)|Industrial Grade|124|Sawed-Off|0.11|0.40|149.00
Souvenir Sawed-Off | Snake Camo (Factory New)|Industrial Grade|124|Sawed-Off|0.11|0.40|149.00
SG 553 | Damascus Steel (Factory New)|Mil-Spec|125|SG 553|0.11|0.11|28.00
Souvenir SG 553 | Damascus Steel (Factory New)|Mil-Spec|125|SG 553|0.11|0.11|28.00
AK-47 | Safari Mesh (Factory New)|Industrial Grade|126|AK-47|0.18|0.21|84.00
Souvenir AK-47 | Safari Mesh (Factory New)|Industrial Grade|126|AK-47|0.18|0.21|84.00
SCAR-20 | Sand Mesh (Factory New)|Consumer Grade|127|SCAR-20|0.11|0.42|86.00
Souvenir SCAR-20 | Sand Mesh (Factory New)|Consumer Grade|127|SCAR-20|0.11|0.42|86.00
Five-SeveN | Orange Peel (Factory New)|Industrial Grade|128|Five-SeveN|0.06|0.52|27.00
Souvenir Five-SeveN | Orange Peel (Factory New)|Industrial Grade|128|Five-SeveN|0.06|0.52|27.00
P2000 | Amber Fade (Factory New)|Restricted|129|P2000|0.17|0.11|28.00
Souvenir P2000 | Amber Fade (Factory New)|Restricted|129|P2000|0.17|0.11|28.00
P90 | Sand Spray (Factory New)|Consumer Grade|130|P90|0.10|0.44|27.00
Souvenir P90 | Sand Spray (Factory New)|Consumer Grade|130|P90|0.10|0.44|27.00
MP9 | Sand Dashed (Factory New)|Consumer Grade|131|MP9|0.11|0.42|112.00
Souvenir MP9 | Sand Dashed (Factory New)|Consumer Grade|131|MP9|0.11|0.42|112.00
PP-Bizon | Brass (Factory New)|Mil-Spec|132|PP-Bizon|0.15|0.67|45.00
Souvenir PP-Bizon | Brass (Factory New)|Mil-Spec|132|PP-Bizon|0.15|0.67|45.00
MAC-10 | Palm (Factory New)|Industrial Grade|133|MAC-10|0.13|0.27|224.00
Souvenir MAC-10 | Palm (Factory New)|Industrial Grade|133|MAC-10|0.13|0.27|224.00
Tec-9 | VariCamo (Factory New)|Industrial Grade|134|Tec-9|0.06|0.45|94.00
Souvenir Tec-9 | VariCamo (Factory New)|Industrial Grade|134|Tec-9|0.06|0.45|94.00
Nova | Predator (Factory New)|Consumer Grade|135|Nova|0.08|0.42|19.00
Souvenir Nova | Predator (Factory New)|Consumer Grade|135|Nova|0.08|0.42|19.00
M4A1-S | VariCamo (Factory New)|Mil-Spec|136|M4A1-S|0.08|0.36|64.00
Souvenir M4A1-S | VariCamo (Factory New)|Mil-Spec|136|M4A1-S|0.08|0.36|64.00
XM1014 | CaliCamo (Factory New)|Industrial Grade|137|XM1014|0.05|0.45|125.00
Souvenir XM1014 | CaliCamo (Factory New)|Industrial Grade|137|XM1014|0.05|0.45|125.00
Tec-9 | Groundwater (Factory New)|Consumer Grade|138|Tec-9|0.11|0.39|216.00
Souvenir Tec-9 | Groundwater (Factory New)|Consumer Grade|138|Tec-9|0.11|0.39|216.00
Sawed-Off | Full Stop (Factory New)|Mil-Spec|139|Sawed-Off|0.05|0.40|53.00
Souvenir Sawed-Off | Full Stop (Factory New)|Mil-Spec|139|Sawed-Off|0.05|0.40|53.00
AUG | Contractor (Factory New)|Consumer Grade|140|AUG|0.38|0.17|24.00
Souvenir AUG | Contractor (Factory New)|Consumer Grade|140|AUG|0.38|0.17|24.00
M4A1-S | Boreal Forest (Factory New)|Industrial Grade|141|M4A1-S|0.11|0.27|104.00
Souvenir M4A1-S | Boreal Forest (Factory New)|Industrial Grade|141|M4A1-S|0.11|0.27|104.00
FAMAS | Colony (Factory New)|Consumer Grade|142|FAMAS|0.14|0.36|188.00
Souvenir FAMAS | Colony (Factory New)|Consumer Grade|142|FAMAS|0.14|0.36|188.00
UMP-45 | Gunsmoke (Factory New)|Industrial Grade|143|UMP-45|0.10|0.11|64.00
Souvenir UMP-45 | Gunsmoke (Factory New)|Industrial Grade|143|UMP-45|0.10|0.11|64.00
Nova | Sand Dune (Factory New)|Consumer Grade|145|Nova|0.12|0.26|39.00
Souvenir Nova | Sand Dune (Factory New)|Consumer Grade|145|Nova|0.12|0.26|39.00
Glock-18 | Candy Apple (Factory New)|Mil-Spec|146|Glock-18|0.00|0.83|222.00
Souvenir Glock-18 | Candy Apple (Factory New)|Mil-Spec|146|Glock-18|0.00|0.83|222.00
P2000 | Granite Marbleized (Factory New)|Industrial Grade|147|P2000|0.62|0.50|56.00
Souvenir P2000 | Granite Marbleized (Factory New)|Industrial Grade|147|P2000|0.62|0.50|56.00
Dual Berettas | Stained (Factory New)|Industrial Grade|148|Dual Berettas|0.11|0.12|26.00
Souvenir Dual Berettas | Stained (Factory New)|Industrial Grade|148|Dual Berettas|0.11|0.12|26.00
MP7 | Anodized Navy (Factory New)|Mil-Spec|149|MP7|0.60|0.49|35.00
Souvenir MP7 | Anodized Navy (Factory New)|Mil-Spec|149|MP7|0.60|0.49|35.00
PP-Bizon | Sand Dashed (Factory New)|Consumer Grade|150|PP-Bizon|0.00|0.00|10.00
Souvenir PP-Bizon | Sand Dashed (Factory New)|Consumer Grade|150|PP-Bizon|0.00|0.00|10.00
Nova | Candy Apple (Factory New)|Industrial Grade|151|Nova|0.09|0.10|86.00
Souvenir Nova | Candy Apple (Factory New)|Industrial Grade|151|Nova|0.09|0.10|86.00
P250 | Boreal Forest (Factory New)|Consumer Grade|152|P250|0.11|0.27|104.00
Souvenir P250 | Boreal Forest (Factory New)|Consumer Grade|152|P250|0.11|0.27|104.00
USP-S | Night Ops (Factory New)|Mil-Spec|153|USP-S|0.64|0.23|48.00
Souvenir USP-S | Night Ops (Factory New)|Mil-Spec|153|USP-S|0.64|0.23|48.00
Desert Eagle | Mudder (Factory New)|Industrial Grade|154|Desert Eagle|0.11|0.42|80.00
Souvenir Desert Eagle | Mudder (Factory New)|Industrial Grade|154|Desert Eagle|0.11|0.42|80.00
XM1014 | Blue Spruce (Factory New)|Consumer Grade|155|XM1014|0.46|0.26|31.00
Souvenir XM1014 | Blue Spruce (Factory New)|Consumer Grade|155|XM1014|0.46|0.26|31.00
AUG | Storm (Factory New)|Consumer Grade|156|AUG|0.19|0.12|75.00
Souvenir AUG | Storm (Factory New)|Consumer Grade|156|AUG|0.19|0.12|75.00
AWP | Safari Mesh (Factory New)|Industrial Grade|157|AWP|0.08|0.10|20.00
Souvenir AWP | Safari Mesh (Factory New)|Industrial Grade|157|AWP|0.08|0.10|20.00
Dual Berettas | Cobalt Quartz (Factory New)|Restricted|158|Dual Berettas|0.11|0.12|26.00
Souvenir Dual Berettas | Cobalt Quartz (Factory New)|Restricted|158|Dual Berettas|0.11|0.12|26.00
Galil AR | Sage Spray (Factory New)|Consumer Grade|159|Galil AR|0.17|0.04|255.00
Souvenir Galil AR | Sage Spray (Factory New)|Consumer Grade|159|Galil AR|0.17|0.04|255.00
PP-Bizon | Night Ops (Factory New)|Industrial Grade|160|PP-Bizon|0.65|0.21|47.00
Souvenir PP-Bizon | Night Ops (Factory New)|Industrial Grade|160|PP-Bizon|0.65|0.21|47.00
P90 | Teardown (Factory New)|Mil-Spec|161|P90|0.63|0.47|97.00
Souvenir P90 | Teardown (Factory New)|Mil-Spec|161|P90|0.63|0.47|97.00
SG 553 | Waves Perforated (Factory New)|Consumer Grade|162|SG 553|0.47|0.15|131.00
Souvenir SG 553 | Waves Perforated (Factory New)|Consumer Grade|162|SG 553|0.47|0.15|131.00
G3SG1 | Jungle Dashed (Factory New)|Consumer Grade|163|G3SG1|0.11|0.36|61.00
Souvenir G3SG1 | Jungle Dashed (Factory New)|Consumer Grade|163|G3SG1|0.11|0.36|61.00
FAMAS | Cyanospatter (Factory New)|Industrial Grade|164|FAMAS|0.24|0.16|96.00
Souvenir FAMAS | Cyanospatter (Factory New)|Industrial Grade|164|FAMAS|0.24|0.16|96.00
XM1014 | Blue Steel (Factory New)|Industrial Grade|165|XM1014|0.60|0.28|18.00
Souvenir XM1014 | Blue Steel (Factory New)|Industrial Grade|165|XM1014|0.60|0.28|18.00
SG 553 | Anodized Navy (Factory New)|Mil-Spec|166|SG 553|0.60|0.51|37.00
Souvenir SG 553 | Anodized Navy (Factory New)|Mil-Spec|166|SG 553|0.60|0.51|37.00
P250 | Bone Mask (Factory New)|Consumer Grade|167|P250|0.14|0.20|188.00
Souvenir P250 | Bone Mask (Factory New)|Consumer Grade|167|P250|0.14|0.20|188.00
Negev | CaliCamo (Factory New)|Industrial Grade|168|Negev|0.08|0.50|4.00
Souvenir Negev | CaliCamo (Factory New)|Industrial Grade|168|Negev|0.08|0.50|4.00
Five-SeveN | Contractor (Factory New)|Consumer Grade|169|Five-SeveN|0.35|0.15|94.00
Souvenir Five-SeveN | Contractor (Factory New)|Consumer Grade|169|Five-SeveN|0.35|0.15|94.00
AUG | Colony (Factory New)|Consumer Grade|170|AUG|0.19|0.12|75.00
Souvenir AUG | Colony (Factory New)|Consumer Grade|170|AUG|0.19|0.12|75.00
MAG-7 | Bulldozer (Factory New)|Restricted|171|MAG-7|0.15|0.75|255.00
Souvenir MAG-7 | Bulldozer (Factory New)|Restricted|171|MAG-7|0.15|0.75|255.00
MAC-10 | Amber Fade (Factory New)|Mil-Spec|172|MAC-10|0.10|0.11|62.00
Souvenir MAC-10 | Amber Fade (Factory New)|Mil-Spec|172|MAC-10|0.10|0.11|62.00
G3SG1 | Safari Mesh (Factory New)|Consumer Grade|173|G3SG1|0.12|0.32|117.00
Souvenir G3SG1 | Safari Mesh (Factory New)|Consumer Grade|173|G3SG1|0.12|0.32|117.00
SSG 08 | Tropical Storm (Factory New)|Industrial Grade|174|SSG 08|0.58|0.38|73.00
Souvenir SSG 08 | Tropical Storm (Factory New)|Industrial Grade|174|SSG 08|0.58|0.38|73.00
P90 | Scorched (Factory New)|Consumer Grade|175|P90|0.00|0.00|24.00
Souvenir P90 | Scorched (Factory New)|Consumer Grade|175|P90|0.00|0.00|24.00
SG 553 | Gator Mesh (Factory New)|Industrial Grade|176|SG 553|0.17|0.03|39.00
Souvenir SG 553 | Gator Mesh (Factory New)|Industrial Grade|176|SG 553|0.17|0.03|39.00
Galil AR | Hunting Blind (Factory New)|Consumer Grade|177|Galil AR|0.10|0.56|75.00
Souvenir Galil AR | Hunting Blind (Factory New)|Consumer Grade|177|Galil AR|0.10|0.56|75.00
Glock-18 | Groundwater (Factory New)|Industrial Grade|178|Glock-18|0.24|0.25|182.00
Souvenir Glock-18 | Groundwater (Factory New)|Industrial Grade|178|Glock-18|0.24|0.25|182.00
UMP-45 | Blaze (Factory New)|Mil-Spec|179|UMP-45|0.08|0.08|25.00
Souvenir UMP-45 | Blaze (Factory New)|Mil-Spec|179|UMP-45|0.08|0.08|25.00
MP7 | Orange Peel (Factory New)|Industrial Grade|180|MP7|0.06|0.29|148.00
Souvenir MP7 | Orange Peel (Factory New)|Industrial Grade|180|MP7|0.06|0.29|148.00
MP9 | Hot Rod (Factory New)|Mil-Spec|181|MP9|0.00|0.91|44.00
Souvenir MP9 | Hot Rod (Factory New)|Mil-Spec|181|MP9|0.00|0.91|44.00
Dual Berettas | Contractor (Factory New)|Consumer Grade|182|Dual Berettas|0.39|0.15|20.00
Souvenir Dual Berettas | Contractor (Factory New)|Consumer Grade|182|Dual Berettas|0.39|0.15|20.00
SCAR-20 | Contractor (Factory New)|Consumer Grade|183|SCAR-20|0.33|0.13|23.00
Souvenir SCAR-20 | Contractor (Factory New)|Consumer Grade|183|SCAR-20|0.33|0.13|23.00
G3SG1 | VariCamo (Factory New)|Industrial Grade|184|G3SG1|0.06|0.42|90.00
Souvenir G3SG1 | VariCamo (Factory New)|Industrial Grade|184|G3SG1|0.06|0.42|90.00
SSG 08 | Blue Spruce (Factory New)|Consumer Grade|185|SSG 08|0.44|0.23|111.00
Souvenir SSG 08 | Blue Spruce (Factory New)|Consumer Grade|185|SSG 08|0.44|0.23|111.00
SSG 08 | Acid Fade (Factory New)|Mil-Spec|186|SSG 08|0.22|0.13|23.00
Souvenir SSG 08 | Acid Fade (Factory New)|Mil-Spec|186|SSG 08|0.22|0.13|23.00
M249 | Gator Mesh (Factory New)|Industrial Grade|187|M249|0.21|0.29|14.00
Souvenir M249 | Gator Mesh (Factory New)|Industrial Grade|187|M249|0.21|0.29|14.00
Galil AR | VariCamo (Factory New)|Industrial Grade|188|Galil AR|0.11|0.41|54.00
Souvenir Galil AR | VariCamo (Factory New)|Industrial Grade|188|Galil AR|0.11|0.41|54.00
M4A1-S | Nitro (Factory New)|Restricted|189|M4A1-S|0.12|0.11|94.00
Souvenir M4A1-S | Nitro (Factory New)|Restricted|189|M4A1-S|0.12|0.11|94.00
Tec-9 | Army Mesh (Factory New)|Consumer Grade|190|Tec-9|0.10|0.12|60.00
Souvenir Tec-9 | Army Mesh (Factory New)|Consumer Grade|190|Tec-9|0.10|0.12|60.00
Five-SeveN | Silver Quartz (Factory New)|Mil-Spec|191|Five-SeveN|0.23|0.09|58.00
Souvenir Five-SeveN | Silver Quartz (Factory New)|Mil-Spec|191|Five-SeveN|0.23|0.09|58.00
MP7 | Army Recon (Factory New)|Consumer Grade|192|MP7|0.18|0.36|74.00
Souvenir MP7 | Army Recon (Factory New)|Consumer Grade|192|MP7|0.18|0.36|74.00
USP-S | Forest Leaves (Factory New)|Industrial Grade|193|USP-S|0.20|0.43|72.00
Souvenir USP-S | Forest Leaves (Factory New)|Industrial Grade|193|USP-S|0.20|0.43|72.00
AUG | Condemned (Factory New)|Industrial Grade|194|AUG|0.19|0.12|75.00
Souvenir AUG | Condemned (Factory New)|Industrial Grade|194|AUG|0.19|0.12|75.00
FAMAS | Teardown (Factory New)|Mil-Spec|195|FAMAS|0.63|0.51|95.00
Souvenir FAMAS | Teardown (Factory New)|Mil-Spec|195|FAMAS|0.63|0.51|95.00
MP9 | Orange Peel (Factory New)|Industrial Grade|196|MP9|0.06|0.48|92.00
Souvenir MP9 | Orange Peel (Factory New)|Industrial Grade|196|MP9|0.06|0.48|92.00
UMP-45 | Urban DDPAT (Factory New)|Consumer Grade|197|UMP-45|0.10|0.11|64.00
Souvenir UMP-45 | Urban DDPAT (Factory New)|Consumer Grade|197|UMP-45|0.10|0.11|64.00
P250 | Metallic DDPAT (Factory New)|Industrial Grade|198|P250|0.08|0.05|44.00
Souvenir P250 | Metallic DDPAT (Factory New)|Industrial Grade|198|P250|0.08|0.05|44.00
Dual Berettas | Colony (Factory New)|Consumer Grade|199|Dual Berettas|0.33|0.05|21.00
Souvenir Dual Berettas | Colony (Factory New)|Consumer Grade|199|Dual Berettas|0.33|0.05|21.00
G3SG1 | Polar Camo (Factory New)|Consumer Grade|200|G3SG1|0.17|0.08|13.00
Souvenir G3SG1 | Polar Camo (Factory New)|Consumer Grade|200|G3SG1|0.17|0.08|13.00
Desert Eagle | Urban Rubble (Factory New)|Mil-Spec|201|Desert Eagle|0.25|0.02|90.00
Souvenir Desert Eagle | Urban Rubble (Factory New)|Mil-Spec|201|Desert Eagle|0.25|0.02|90.00
Tec-9 | Red Quartz (Factory New)|Restricted|202|Tec-9|0.50|0.04|56.00
Souvenir Tec-9 | Red Quartz (Factory New)|Restricted|202|Tec-9|0.50|0.04|56.00
Five-SeveN | Forest Night (Factory New)|Consumer Grade|203|Five-SeveN|0.55|0.23|123.00
Souvenir Five-SeveN | Forest Night (Factory New)|Consumer Grade|203|Five-SeveN|0.55|0.23|123.00
MAG-7 | Metallic DDPAT (Factory New)|Industrial Grade|204|MAG-7|0.67|0.04|25.00
Souvenir MAG-7 | Metallic DDPAT (Factory New)|Industrial Grade|204|MAG-7|0.67|0.04|25.00
SCAR-20 | Carbon Fiber (Factory New)|Industrial Grade|205|SCAR-20|0.10|0.09|53.00
Souvenir SCAR-20 | Carbon Fiber (Factory New)|Industrial Grade|205|SCAR-20|0.10|0.09|53.00
Sawed-Off | Amber Fade (Factory New)|Mil-Spec|206|Sawed-Off|0.20|0.37|43.00
Souvenir Sawed-Off | Amber Fade (Factory New)|Mil-Spec|206|Sawed-Off|0.20|0.37|43.00
Nova | Polar Mesh (Factory New)|Consumer Grade|207|Nova|0.11|0.11|54.00
Souvenir Nova | Polar Mesh (Factory New)|Consumer Grade|207|Nova|0.11|0.11|54.00
P90 | Ash Wood (Factory New)|Industrial Grade|208|P90|0.10|0.20|41.00
Souvenir P90 | Ash Wood (Factory New)|Industrial Grade|208|P90|0.10|0.20|41.00
PP-Bizon | Urban Dashed (Factory New)|Consumer Grade|209|PP-Bizon|0.00|0.00|10.00
Souvenir PP-Bizon | Urban Dashed (Factory New)|Consumer Grade|209|PP-Bizon|0.00|0.00|10.00
MAC-10 | Candy Apple (Factory New)|Industrial Grade|210|MAC-10|0.00|0.83|229.00
Souvenir MAC-10 | Candy Apple (Factory New)|Industrial Grade|210|MAC-10|0.00|0.83|229.00
M4A4 | Urban DDPAT (Factory New)|Industrial Grade|211|M4A4|0.10|0.10|68.00
Souvenir M4A4 | Urban DDPAT (Factory New)|Industrial Grade|211|M4A4|0.10|0.10|68.00
Five-SeveN | Kami (Factory New)|Mil-Spec|213|Five-SeveN|0.10|0.11|65.00
M249 | Magma (Factory New)|Mil-Spec|214|M249|0.23|0.25|191.00
PP-Bizon | Cobalt Halftone (Factory New)|Mil-Spec|215|PP-Bizon|0.61|0.23|79.00
FAMAS | Pulse (Factory New)|Restricted|216|FAMAS|0.11|0.11|55.00
Dual Berettas | Marina (Factory New)|Restricted|217|Dual Berettas|0.62|0.60|60.00
MP9 | Rose Iron (Factory New)|Restricted|218|MP9|0.11|0.08|38.00
Nova | Rising Skull (Factory New)|Restricted|219|Nova|0.17|0.09|33.00
M4A1-S | Guardian (Factory New)|Classified|220|M4A1-S|0.56|0.34|88.00
P250 | Mehndi (Factory New)|Classified|221|P250|0.08|0.25|63.00
Galil AR | Blue Titanium (Factory New)|Mil-Spec|224|Galil AR|0.18|0.12|85.00
AK-47 | Blue Laminate (Factory New)|Restricted|225|AK-47|0.17|0.08|61.00
Desert Eagle | Cobalt Disruption (Factory New)|Classified|226|Desert Eagle|0.59|0.81|16.00
PP-Bizon | Water Sigil (Factory New)|Mil-Spec|227|PP-Bizon|0.66|0.35|82.00
Nova | Ghost Camo (Factory New)|Mil-Spec|228|Nova|0.02|0.56|97.00
AWP | Electric Hive (Factory New)|Classified|229|AWP|0.21|0.14|57.00
M4A4 | X-Ray (Factory New)|Covert|230|M4A4|0.04|0.44|9.00
G3SG1 | Azure Zebra (Factory New)|Mil-Spec|231|G3SG1|0.57|0.10|50.00
P250 | Steel Disruption (Factory New)|Mil-Spec|232|P250|0.57|0.28|36.00
P90 | Blind Spot (Factory New)|Restricted|233|P90|0.54|0.84|113.00
FAMAS | Afterimage (Factory New)|Classified|234|FAMAS|0.65|0.12|84.00
Five-SeveN | Nightshade (Factory New)|Mil-Spec|235|Five-SeveN|0.55|0.31|94.00
Sawed-Off | The Kraken (Factory New)|Covert|236|Sawed-Off|0.11|0.10|29.00
CZ75-Auto | Crimson Web (Factory New)|Mil-Spec|237|CZ75-Auto|0.12|0.12|58.00
P2000 | Red FragCam (Factory New)|Mil-Spec|238|P2000|0.02|0.35|118.00
Dual Berettas | Panther (Factory New)|Mil-Spec|239|Dual Berettas|0.00|0.78|54.00
USP-S | Stainless (Factory New)|Mil-Spec|240|USP-S|0.17|0.10|10.00
Glock-18 | Blue Fissure (Factory New)|Mil-Spec|241|Glock-18|0.63|0.74|118.00
CZ75-Auto | Tread Plate (Factory New)|Restricted|242|CZ75-Auto|0.17|0.06|31.00
Tec-9 | Titanium Bit (Factory New)|Restricted|243|Tec-9|0.50|0.04|56.00
Desert Eagle | Heirloom (Factory New)|Restricted|244|Desert Eagle|0.10|0.12|41.00
Five-SeveN | Copper Galaxy (Factory New)|Restricted|245|Five-SeveN|0.17|0.06|17.00
CZ75-Auto | The Fuschia Is Now (Factory New)|Classified|246|CZ75-Auto|0.08|0.11|73.00
P250 | Undertow (Factory New)|Classified|247|P250|0.17|0.08|48.00
CZ75-Auto | Victoria (Factory New)|Covert|248|CZ75-Auto|0.17|0.09|45.00
UMP-45 | Corporal (Factory New)|Mil-Spec|249|UMP-45|0.19|0.12|75.00
Negev | Terrain (Factory New)|Mil-Spec|250|Negev|0.21|0.13|53.00
MAG-7 | Heaven Guard (Factory New)|Mil-Spec|252|MAG-7|0.56|0.13|23.00
MAC-10 | Heat (Factory New)|Restricted|253|MAC-10|0.10|0.11|75.00
USP-S | Guardian (Factory New)|Restricted|256|USP-S|0.10|0.11|75.00
Nova | Antique (Factory New)|Classified|259|Nova|0.08|0.21|19.00
AUG | Chameleon (Factory New)|Covert|261|AUG|0.10|0.11|45.00
★ Gut Knife | Vanilla (Factory New)|Covert|262|Gut Knife|0.63|0.07|120.00
★ Gut Knife | Blue Steel (Factory New)|Covert|263|Gut Knife|0.58|0.30|40.00
★ Gut Knife | Boreal Forest (Factory New)|Covert|264|Gut Knife|0.18|0.10|127.00
★ Gut Knife | Case Hardened (Factory New)|Covert|265|Gut Knife|0.50|0.27|255.00
★ Gut Knife | Crimson Web (Factory New)|Covert|266|Gut Knife|0.00|0.69|154.00
★ Gut Knife | Fade (Factory New)|Covert|267|Gut Knife|0.09|0.71|98.00
★ Gut Knife | Forest DDPAT (Factory New)|Covert|268|Gut Knife|0.15|0.20|135.00
★ Gut Knife | Night (Factory New)|Covert|269|Gut Knife|0.58|0.17|78.00
★ Gut Knife | Safari Mesh (Factory New)|Covert|270|Gut Knife|0.20|0.18|106.00
★ Gut Knife | Scorched (Factory New)|Covert|271|Gut Knife|0.58|0.04|49.00
★ Gut Knife | Slaughter (Factory New)|Covert|272|Gut Knife|0.99|0.66|73.00
★ Gut Knife | Stained (Factory New)|Covert|273|Gut Knife|0.50|0.00|255.00
★ Gut Knife | Urban Masked (Factory New)|Covert|274|Gut Knife|0.45|0.06|187.00
★ Flip Knife | Vanilla (Factory New)|Covert|275|Flip Knife|0.67|0.02|94.00
★ Flip Knife | Blue Steel (Factory New)|Covert|276|Flip Knife|0.58|0.30|33.00
★ Flip Knife | Boreal Forest (Factory New)|Covert|277|Flip Knife|0.18|0.39|145.00
★ Flip Knife | Case Hardened (Factory New)|Covert|278|Flip Knife|0.00|0.00|38.00
★ Flip Knife | Crimson Web (Factory New)|Covert|279|Flip Knife|0.90|0.07|67.00
★ Flip Knife | Fade (Factory New)|Covert|280|Flip Knife|0.09|0.73|93.00
★ Flip Knife | Forest DDPAT (Factory New)|Covert|281|Flip Knife|0.27|0.31|101.00
★ Flip Knife | Night (Factory New)|Covert|282|Flip Knife|0.56|0.09|68.00
★ Flip Knife | Safari Mesh (Factory New)|Covert|283|Flip Knife|0.22|0.16|95.00
★ Flip Knife | Scorched (Factory New)|Covert|284|Flip Knife|0.00|0.00|37.00
★ Flip Knife | Slaughter (Factory New)|Covert|285|Flip Knife|0.00|0.62|104.00
★ Flip Knife | Stained (Factory New)|Covert|286|Flip Knife|0.42|0.03|67.00
★ Flip Knife | Urban Masked (Factory New)|Covert|287|Flip Knife|0.27|0.05|177.00
★ Bayonet | Vanilla (Factory New)|Covert|288|Bayonet|0.58|0.08|195.00
★ Bayonet | Blue Steel (Factory New)|Covert|289|Bayonet|0.59|0.31|49.00
★ Bayonet | Boreal Forest (Factory New)|Covert|290|Bayonet|0.13|0.18|132.00
★ Bayonet | Case Hardened (Factory New)|Covert|291|Bayonet|0.21|0.16|91.00
★ Bayonet | Crimson Web (Factory New)|Covert|292|Bayonet|0.01|0.69|179.00
★ Bayonet | Fade (Factory New)|Covert|293|Bayonet|0.97|0.74|112.00
★ Bayonet | Forest DDPAT (Factory New)|Covert|294|Bayonet|0.27|0.30|123.00
★ Bayonet | Night (Factory New)|Covert|295|Bayonet|0.56|0.09|87.00
★ Bayonet | Safari Mesh (Factory New)|Covert|296|Bayonet|0.17|0.20|122.00
★ Bayonet | Scorched (Factory New)|Covert|297|Bayonet|0.17|0.02|56.00
★ Bayonet | Slaughter (Factory New)|Covert|298|Bayonet|0.00|0.57|145.00
★ Bayonet | Stained (Factory New)|Covert|299|Bayonet|0.53|0.05|94.00
★ Bayonet | Urban Masked (Factory New)|Covert|300|Bayonet|0.28|0.04|213.00
★ M9 Bayonet | Vanilla (Factory New)|Covert|301|M9 Bayonet|0.56|0.16|137.00
★ M9 Bayonet | Blue Steel (Factory New)|Covert|302|M9 Bayonet|0.58|0.30|33.00
★ M9 Bayonet | Boreal Forest (Factory New)|Covert|303|M9 Bayonet|0.16|0.14|108.00
★ M9 Bayonet | Case Hardened (Factory New)|Covert|304|M9 Bayonet|0.17|0.27|255.00
★ M9 Bayonet | Crimson Web (Factory New)|Covert|305|M9 Bayonet|0.00|0.71|148.00
★ M9 Bayonet | Fade (Factory New)|Covert|306|M9 Bayonet|0.98|0.76|99.00
★ M9 Bayonet | Forest DDPAT (Factory New)|Covert|307|M9 Bayonet|0.15|0.20|129.00
★ M9 Bayonet | Night (Factory New)|Covert|308|M9 Bayonet|0.57|0.16|73.00
★ M9 Bayonet | Safari Mesh (Factory New)|Covert|309|M9 Bayonet|0.22|0.16|129.00
★ M9 Bayonet | Scorched (Factory New)|Covert|310|M9 Bayonet|0.67|0.03|38.00
★ M9 Bayonet | Slaughter (Factory New)|Covert|311|M9 Bayonet|0.00|0.62|111.00
★ M9 Bayonet | Stained (Factory New)|Covert|312|M9 Bayonet|0.33|0.03|70.00
★ M9 Bayonet | Urban Masked (Factory New)|Covert|313|M9 Bayonet|0.53|0.04|112.00
★ Karambit | Vanilla (Factory New)|Covert|314|Karambit|0.67|0.03|33.00
★ Karambit | Blue Steel (Factory New)|Covert|315|Karambit|0.50|0.02|255.00
★ Karambit | Boreal Forest (Factory New)|Covert|316|Karambit|0.17|0.11|108.00
★ Karambit | Case Hardened (Factory New)|Covert|317|Karambit|0.50|0.04|255.00
★ Karambit | Crimson Web (Factory New)|Covert|318|Karambit|0.50|0.05|75.00
★ Karambit | Fade (Factory New)|Covert|319|Karambit|0.53|0.06|89.00
★ Karambit | Forest DDPAT (Factory New)|Covert|320|Karambit|0.08|0.18|79.00
★ Karambit | Night (Factory New)|Covert|321|Karambit|0.00|0.01|70.00
★ Karambit | Safari Mesh (Factory New)|Covert|322|Karambit|0.29|0.12|99.00
★ Karambit | Scorched (Factory New)|Covert|323|Karambit|0.58|0.05|83.00
★ Karambit | Slaughter (Factory New)|Covert|324|Karambit|0.53|0.06|89.00
★ Karambit | Stained (Factory New)|Covert|325|Karambit|0.53|0.06|85.00
★ Karambit | Urban Masked (Factory New)|Covert|326|Karambit|0.48|0.06|184.00
Tec-9 | Isaac (Factory New)|Mil-Spec|327|Tec-9|0.11|0.11|53.00
Dual Berettas | Retribution (Factory New)|Mil-Spec|329|Dual Berettas|0.17|0.08|12.00
Galil AR | Kami (Factory New)|Mil-Spec|330|Galil AR|0.56|0.05|66.00
P90 | Desert Warfare (Factory New)|Mil-Spec|331|P90|0.10|0.10|48.00
CZ75-Auto | Poison Dart (Factory New)|Mil-Spec|332|CZ75-Auto|0.08|0.07|28.00
AUG | Torque (Factory New)|Restricted|333|AUG|0.07|0.13|38.00
PP-Bizon | Antique (Factory New)|Restricted|334|PP-Bizon|0.00|0.00|3.00
MAC-10 | Curse (Factory New)|Restricted|335|MAC-10|0.01|0.52|255.00
XM1014 | Heaven Guard (Factory New)|Restricted|336|XM1014|0.50|0.04|25.00
M4A1-S | Atomic Alloy (Factory New)|Classified|337|M4A1-S|0.03|0.33|18.00
SCAR-20 | Cyrex (Factory New)|Classified|338|SCAR-20|0.08|0.10|77.00
USP-S | Orion (Factory New)|Classified|339|USP-S|0.08|0.11|54.00
AK-47 | Vulcan (Factory New)|Covert|340|AK-47|0.10|0.11|47.00
M4A4 | Howl (Factory New)|Contraband|341|M4A4|0.10|0.11|89.00
P250 | Franklin (Factory New)|Classified|342|P250|0.14|0.14|221.00
AK-47 | Emerald Pinstripe (Factory New)|Restricted|343|AK-47|0.17|0.08|61.00
CZ75-Auto | Tuxedo (Factory New)|Mil-Spec|344|CZ75-Auto|0.14|0.20|84.00
Desert Eagle | Meteorite (Factory New)|Mil-Spec|345|Desert Eagle|0.10|0.33|15.00
G3SG1 | Green Apple (Factory New)|Industrial Grade|346|G3SG1|0.10|0.10|78.00
Galil AR | Tuxedo (Factory New)|Mil-Spec|347|Galil AR|0.14|0.20|85.00
MAC-10 | Silver (Factory New)|Industrial Grade|349|MAC-10|0.25|0.02|90.00
MP7 | Forest DDPAT (Factory New)|Consumer Grade|350|MP7|0.12|0.33|120.00
Negev | Army Sheen (Factory New)|Consumer Grade|351|Negev|0.19|0.12|73.00
Nova | Caged Steel (Factory New)|Industrial Grade|352|Nova|0.17|0.07|15.00
Sawed-Off | Forest DDPAT (Factory New)|Consumer Grade|353|Sawed-Off|0.08|0.35|74.00
SG 553 | Army Sheen (Factory New)|Consumer Grade|354|SG 553|0.11|0.11|28.00
Tec-9 | Urban DDPAT (Factory New)|Consumer Grade|355|Tec-9|0.10|0.11|66.00
UMP-45 | Carbon Fiber (Factory New)|Industrial Grade|356|UMP-45|0.10|0.11|64.00
★ Huntsman Knife | Vanilla (Factory New)|Covert|357|Huntsman Knife|0.67|0.05|41.00
★ Huntsman Knife | Blue Steel (Factory New)|Covert|358|Huntsman Knife|0.58|0.05|40.00
★ Huntsman Knife | Boreal Forest (Factory New)|Covert|359|Huntsman Knife|0.17|0.11|114.00
★ Huntsman Knife | Case Hardened (Factory New)|Covert|360|Huntsman Knife|0.50|0.05|38.00
★ Huntsman Knife | Crimson Web (Factory New)|Covert|361|Huntsman Knife|0.50|0.05|38.00
★ Huntsman Knife | Fade (Factory New)|Covert|362|Huntsman Knife|0.17|0.39|255.00
★ Huntsman Knife | Forest DDPAT (Factory New)|Covert|363|Huntsman Knife|0.15|0.19|129.00
★ Huntsman Knife | Night (Factory New)|Covert|364|Huntsman Knife|0.58|0.14|78.00
★ Huntsman Knife | Safari Mesh (Factory New)|Covert|365|Huntsman Knife|0.21|0.16|106.00
★ Huntsman Knife | Scorched (Factory New)|Covert|366|Huntsman Knife|0.50|0.05|38.00
★ Huntsman Knife | Slaughter (Factory New)|Covert|367|Huntsman Knife|0.50|0.05|38.00
★ Huntsman Knife | Stained (Factory New)|Covert|368|Huntsman Knife|0.50|0.05|38.00
★ Huntsman Knife | Urban Masked (Factory New)|Covert|369|Huntsman Knife|0.50|0.05|38.00
CZ75-Auto | Twist (Factory New)|Mil-Spec|370|CZ75-Auto|0.14|0.07|97.00
P90 | Module (Factory New)|Mil-Spec|371|P90|0.49|0.99|111.00
P2000 | Pulse (Factory New)|Mil-Spec|372|P2000|0.12|0.11|65.00
MAC-10 | Tatter (Factory New)|Restricted|373|MAC-10|0.18|0.12|85.00
USP-S | Caiman (Factory New)|Classified|374|USP-S|0.08|0.11|53.00
M4A4 | Desert-Strike (Factory New)|Covert|375|M4A4|0.00|0.00|3.00
M4A1-S | Cyrex (Factory New)|Covert|376|M4A1-S|0.01|0.66|255.00
MP7 | Urban Hazard (Factory New)|Mil-Spec|377|MP7|0.10|0.10|79.00
Negev | Desert-Strike (Factory New)|Mil-Spec|378|Negev|0.21|0.15|55.00
Nova | Koi (Factory New)|Restricted|379|Nova|0.17|0.07|15.00
P250 | Supernova (Factory New)|Restricted|380|P250|0.17|0.07|44.00
SSG 08 | Abyss (Factory New)|Mil-Spec|381|SSG 08|0.17|0.09|44.00
UMP-45 | Labyrinth (Factory New)|Mil-Spec|382|UMP-45|0.10|0.11|64.00
PP-Bizon | Osiris (Factory New)|Restricted|383|PP-Bizon|0.08|0.12|34.00
CZ75-Auto | Tigris (Factory New)|Restricted|384|CZ75-Auto|0.52|0.22|49.00
Desert Eagle | Conspiracy (Factory New)|Classified|385|Desert Eagle|0.12|0.10|67.00
Five-SeveN | Fowl Play (Factory New)|Classified|386|Five-SeveN|0.23|0.09|58.00
Glock-18 | Water Elemental (Factory New)|Classified|387|Glock-18|0.99|0.68|99.00
P2000 | Ivory (Factory New)|Mil-Spec|388|P2000|0.17|0.12|255.00
P90 | Asiimov (Factory New)|Covert|389|P90|0.33|0.05|223.00
P90 | Leather (Factory New)|Industrial Grade|390|P90|0.18|0.11|87.00
MAC-10 | Commuter (Factory New)|Industrial Grade|391|MAC-10|0.09|0.11|84.00
Sawed-Off | First Class (Factory New)|Mil-Spec|392|Sawed-Off|0.17|0.09|35.00
P2000 | Coach Class (Factory New)|Industrial Grade|393|P2000|0.22|0.08|36.00
USP-S | Business Class (Factory New)|Mil-Spec|394|USP-S|0.03|0.52|84.00
G3SG1 | Contractor (Factory New)|Consumer Grade|395|G3SG1|0.10|0.10|80.00
MP7 | Olive Plaid (Factory New)|Consumer Grade|396|MP7|0.15|0.35|71.00
CZ75-Auto | Green Plaid (Factory New)|Consumer Grade|397|CZ75-Auto|0.35|0.23|71.00
MP9 | Green Plaid (Factory New)|Consumer Grade|398|MP9|0.11|0.36|101.00
SSG 08 | Sand Dune (Factory New)|Consumer Grade|399|SSG 08|0.09|0.28|46.00
SG 553 | Traveler (Factory New)|Industrial Grade|400|SG 553|0.11|0.11|28.00
XM1014 | Red Leather (Factory New)|Mil-Spec|401|XM1014|0.17|0.10|60.00
Desert Eagle | Pilot (Factory New)|Restricted|402|Desert Eagle|0.11|0.13|69.00
AK-47 | Jet Set (Factory New)|Classified|403|AK-47|0.17|0.08|61.00
AK-47 | First Class (Factory New)|Restricted|404|AK-47|0.17|0.08|61.00
AWP | Dragon Lore (Factory New)|Covert|405|AWP|0.11|0.06|51.00
Souvenir AWP | Dragon Lore (Factory New)|Covert|405|AWP|0.11|0.06|51.00
P90 | Storm (Factory New)|Consumer Grade|406|P90|0.33|0.10|239.00
Souvenir P90 | Storm (Factory New)|Consumer Grade|406|P90|0.33|0.10|239.00
UMP-45 | Indigo (Factory New)|Consumer Grade|407|UMP-45|0.43|0.18|92.00
Souvenir UMP-45 | Indigo (Factory New)|Consumer Grade|407|UMP-45|0.43|0.18|92.00
MAC-10 | Indigo (Factory New)|Consumer Grade|408|MAC-10|0.43|0.18|92.00
Souvenir MAC-10 | Indigo (Factory New)|Consumer Grade|408|MAC-10|0.43|0.18|92.00
SCAR-20 | Storm (Factory New)|Consumer Grade|409|SCAR-20|0.33|0.10|68.00
Souvenir SCAR-20 | Storm (Factory New)|Consumer Grade|409|SCAR-20|0.33|0.10|68.00
USP-S | Royal Blue (Factory New)|Industrial Grade|410|USP-S|0.68|0.77|66.00
Souvenir USP-S | Royal Blue (Factory New)|Industrial Grade|410|USP-S|0.68|0.77|66.00
Dual Berettas | Briar (Factory New)|Consumer Grade|411|Dual Berettas|0.26|0.39|18.00
Souvenir Dual Berettas | Briar (Factory New)|Consumer Grade|411|Dual Berettas|0.26|0.39|18.00
Nova | Green Apple (Factory New)|Industrial Grade|412|Nova|0.09|0.10|86.00
Souvenir Nova | Green Apple (Factory New)|Industrial Grade|412|Nova|0.09|0.10|86.00
MAG-7 | Silver (Factory New)|Industrial Grade|413|MAG-7|0.14|0.09|82.00
Souvenir MAG-7 | Silver (Factory New)|Industrial Grade|413|MAG-7|0.14|0.09|82.00
MP9 | Dark Age (Factory New)|Mil-Spec|414|MP9|0.17|0.08|51.00
Souvenir MP9 | Dark Age (Factory New)|Mil-Spec|414|MP9|0.17|0.08|51.00
Desert Eagle | Hand Cannon (Factory New)|Restricted|415|Desert Eagle|0.50|0.21|24.00
Souvenir Desert Eagle | Hand Cannon (Factory New)|Restricted|415|Desert Eagle|0.50|0.21|24.00
P2000 | Chainmail (Factory New)|Mil-Spec|416|P2000|0.15|0.11|81.00
Souvenir P2000 | Chainmail (Factory New)|Mil-Spec|416|P2000|0.15|0.11|81.00
Sawed-Off | Rust Coat (Factory New)|Industrial Grade|417|Sawed-Off|0.05|0.50|32.00
Souvenir Sawed-Off | Rust Coat (Factory New)|Industrial Grade|417|Sawed-Off|0.05|0.50|32.00
M4A1-S | Knight (Factory New)|Classified|418|M4A1-S|0.67|0.03|31.00
Souvenir M4A1-S | Knight (Factory New)|Classified|418|M4A1-S|0.67|0.03|31.00
CZ75-Auto | Chalice (Factory New)|Restricted|419|CZ75-Auto|0.11|0.78|49.00
Souvenir CZ75-Auto | Chalice (Factory New)|Restricted|419|CZ75-Auto|0.11|0.78|49.00
M4A1-S | Master Piece (Factory New)|Classified|420|M4A1-S|0.08|0.10|125.00
Souvenir M4A1-S | Master Piece (Factory New)|Classified|420|M4A1-S|0.08|0.10|125.00
Desert Eagle | Urban DDPAT (Factory New)|Industrial Grade|421|Desert Eagle|0.10|0.11|63.00
Souvenir Desert Eagle | Urban DDPAT (Factory New)|Industrial Grade|421|Desert Eagle|0.10|0.11|63.00
MP7 | Gunsmoke (Factory New)|Industrial Grade|422|MP7|0.06|0.61|61.00
Souvenir MP7 | Gunsmoke (Factory New)|Industrial Grade|422|MP7|0.06|0.61|61.00
Glock-18 | Night (Factory New)|Industrial Grade|423|Glock-18|0.50|0.04|57.00
Souvenir Glock-18 | Night (Factory New)|Industrial Grade|423|Glock-18|0.50|0.04|57.00
P2000 | Grassland (Factory New)|Industrial Grade|424|P2000|0.10|0.44|63.00
Souvenir P2000 | Grassland (Factory New)|Industrial Grade|424|P2000|0.10|0.44|63.00
CZ75-Auto | Nitro (Factory New)|Mil-Spec|425|CZ75-Auto|0.13|0.10|92.00
Souvenir CZ75-Auto | Nitro (Factory New)|Mil-Spec|425|CZ75-Auto|0.13|0.10|92.00
Sawed-Off | Sage Spray (Factory New)|Consumer Grade|426|Sawed-Off|0.17|0.06|255.00
Souvenir Sawed-Off | Sage Spray (Factory New)|Consumer Grade|426|Sawed-Off|0.17|0.06|255.00
UMP-45 | Scorched (Factory New)|Consumer Grade|427|UMP-45|0.00|0.08|25.00
Souvenir UMP-45 | Scorched (Factory New)|Consumer Grade|427|UMP-45|0.00|0.08|25.00
M249 | Contrast Spray (Factory New)|Consumer Grade|428|M249|0.17|0.01|255.00
Souvenir M249 | Contrast Spray (Factory New)|Consumer Grade|428|M249|0.17|0.01|255.00
MAG-7 | Storm (Factory New)|Consumer Grade|429|MAG-7|0.34|0.10|224.00
Souvenir MAG-7 | Storm (Factory New)|Consumer Grade|429|MAG-7|0.34|0.10|224.00
MP9 | Storm (Factory New)|Consumer Grade|430|MP9|0.33|0.10|227.00
Souvenir MP9 | Storm (Factory New)|Consumer Grade|430|MP9|0.33|0.10|227.00
XM1014 | VariCamo Blue (Factory New)|Mil-Spec|431|XM1014|0.83|0.03|89.00
Souvenir XM1014 | VariCamo Blue (Factory New)|Mil-Spec|431|XM1014|0.83|0.03|89.00
AWP | Pink DDPAT (Factory New)|Restricted|432|AWP|0.78|0.04|76.00
Souvenir AWP | Pink DDPAT (Factory New)|Restricted|432|AWP|0.78|0.04|76.00
USP-S | Road Rash (Factory New)|Restricted|433|USP-S|0.19|0.12|65.00
Souvenir USP-S | Road Rash (Factory New)|Restricted|433|USP-S|0.19|0.12|65.00
SSG 08 | Detour (Factory New)|Mil-Spec|434|SSG 08|0.17|0.07|15.00
Souvenir SSG 08 | Detour (Factory New)|Mil-Spec|434|SSG 08|0.17|0.07|15.00
★ Butterfly Knife | Vanilla (Factory New)|Covert|435|Butterfly Knife|0.60|0.18|56.00
★ Butterfly Knife | Blue Steel (Factory New)|Covert|436|Butterfly Knife|0.57|0.30|33.00
★ Butterfly Knife | Boreal Forest (Factory New)|Covert|437|Butterfly Knife|0.38|0.41|105.00
★ Butterfly Knife | Case Hardened (Factory New)|Covert|438|Butterfly Knife|0.58|0.05|42.00
★ Butterfly Knife | Crimson Web (Factory New)|Covert|439|Butterfly Knife|0.73|0.08|64.00
★ Butterfly Knife | Fade (Factory New)|Covert|440|Butterfly Knife|0.08|0.73|93.00
★ Butterfly Knife | Forest DDPAT (Factory New)|Covert|441|Butterfly Knife|0.08|0.20|71.00
★ Butterfly Knife | Night (Factory New)|Covert|442|Butterfly Knife|0.58|0.16|67.00
★ Butterfly Knife | Safari Mesh (Factory New)|Covert|443|Butterfly Knife|0.20|0.19|94.00
★ Butterfly Knife | Scorched (Factory New)|Covert|444|Butterfly Knife|0.67|0.03|37.00
★ Butterfly Knife | Slaughter (Factory New)|Covert|445|Butterfly Knife|0.00|0.60|106.00
★ Butterfly Knife | Stained (Factory New)|Covert|446|Butterfly Knife|0.58|0.05|42.00
★ Butterfly Knife | Urban Masked (Factory New)|Covert|447|Butterfly Knife|0.45|0.06|168.00
M4A4 | Bullet Rain (Factory New)|Covert|448|M4A4|0.10|0.11|65.00
P2000 | Corticera (Factory New)|Classified|449|P2000|0.60|0.52|93.00
AWP | Corticera (Factory New)|Classified|450|AWP|0.17|0.09|32.00
AK-47 | Jaguar (Factory New)|Covert|451|AK-47|0.08|0.10|63.00
Nova | Bloomstick (Factory New)|Classified|452|Nova|0.42|0.12|50.00
AUG | Bengal Tiger (Factory New)|Classified|453|AUG|0.06|0.35|52.00
Desert Eagle | Crimson Web (Factory New)|Restricted|454|Desert Eagle|0.00|0.88|118.00
Glock-18 | Steel Disruption (Factory New)|Restricted|455|Glock-18|0.19|0.12|73.00
MP7 | Ocean Foam (Factory New)|Restricted|456|MP7|0.61|0.57|40.00
PP-Bizon | Blue Streak (Factory New)|Restricted|457|PP-Bizon|0.54|0.87|120.00
Negev | Bratatat (Factory New)|Mil-Spec|459|Negev|0.19|0.12|73.00
CZ75-Auto | Hexane (Factory New)|Mil-Spec|460|CZ75-Auto|0.55|0.47|85.00
USP-S | Blood Tiger (Factory New)|Mil-Spec|461|USP-S|0.08|0.11|56.00
MAC-10 | Ultraviolet (Factory New)|Mil-Spec|462|MAC-10|0.17|0.12|43.00
P90 | Virus (Factory New)|Restricted|464|P90|0.10|0.10|67.00
Galil AR | Cerberus (Factory New)|Restricted|465|Galil AR|0.17|0.70|255.00
Souvenir Galil AR | Cerberus (Factory New)|Restricted|465|Galil AR|0.17|0.70|255.00
Tec-9 | Toxic (Factory New)|Mil-Spec|466|Tec-9|0.06|0.90|251.00
Souvenir Tec-9 | Toxic (Factory New)|Mil-Spec|466|Tec-9|0.06|0.90|251.00
Glock-18 | Reactor (Factory New)|Mil-Spec|467|Glock-18|0.19|0.12|73.00
Souvenir Glock-18 | Reactor (Factory New)|Mil-Spec|467|Glock-18|0.19|0.12|73.00
XM1014 | Bone Machine (Factory New)|Mil-Spec|468|XM1014|0.08|0.10|62.00
Souvenir XM1014 | Bone Machine (Factory New)|Mil-Spec|468|XM1014|0.08|0.10|62.00
MAC-10 | Nuclear Garden (Factory New)|Mil-Spec|469|MAC-10|0.09|0.11|84.00
Souvenir MAC-10 | Nuclear Garden (Factory New)|Mil-Spec|469|MAC-10|0.09|0.11|84.00
AUG | Radiation Hazard (Factory New)|Industrial Grade|470|AUG|0.19|0.12|75.00
Souvenir AUG | Radiation Hazard (Factory New)|Industrial Grade|470|AUG|0.19|0.12|75.00
MP9 | Setting Sun (Factory New)|Mil-Spec|471|MP9|0.09|0.24|62.00
Souvenir MP9 | Setting Sun (Factory New)|Mil-Spec|471|MP9|0.09|0.24|62.00
PP-Bizon | Chemical Green (Factory New)|Industrial Grade|472|PP-Bizon|0.19|0.35|89.00
Souvenir PP-Bizon | Chemical Green (Factory New)|Industrial Grade|472|PP-Bizon|0.19|0.35|89.00
Negev | Nuclear Waste (Factory New)|Industrial Grade|473|Negev|0.07|0.50|14.00
Souvenir Negev | Nuclear Waste (Factory New)|Industrial Grade|473|Negev|0.07|0.50|14.00
FAMAS | Styx (Factory New)|Restricted|474|FAMAS|0.02|0.29|24.00
Souvenir FAMAS | Styx (Factory New)|Restricted|474|FAMAS|0.02|0.29|24.00
P250 | Contamination (Factory New)|Industrial Grade|475|P250|0.17|0.07|44.00
Souvenir P250 | Contamination (Factory New)|Industrial Grade|475|P250|0.17|0.07|44.00
Five-SeveN | Hot Shot (Factory New)|Industrial Grade|476|Five-SeveN|0.17|0.33|85.00
Souvenir Five-SeveN | Hot Shot (Factory New)|Industrial Grade|476|Five-SeveN|0.17|0.33|85.00
SG 553 | Fallout Warning (Factory New)|Industrial Grade|477|SG 553|0.48|0.33|66.00
Souvenir SG 553 | Fallout Warning (Factory New)|Industrial Grade|477|SG 553|0.48|0.33|66.00
AK-47 | Wasteland Rebel (Factory New)|Covert|478|AK-47|0.17|0.07|15.00
Five-SeveN | Urban Hazard (Factory New)|Mil-Spec|479|Five-SeveN|0.01|0.73|253.00
G3SG1 | Murky (Factory New)|Mil-Spec|480|G3SG1|0.17|0.07|29.00
Glock-18 | Grinder (Factory New)|Restricted|481|Glock-18|0.19|0.12|73.00
M4A1-S | Basilisk (Factory New)|Restricted|482|M4A1-S|0.11|0.10|31.00
M4A4 | Griffin (Factory New)|Restricted|483|M4A4|0.10|0.11|89.00
MAG-7 | Firestarter (Factory New)|Mil-Spec|484|MAG-7|0.17|0.10|164.00
MP9 | Dart (Factory New)|Mil-Spec|485|MP9|0.10|0.11|64.00
P250 | Cartel (Factory New)|Classified|486|P250|0.08|0.12|16.00
P2000 | Fire Elemental (Factory New)|Covert|487|P2000|0.61|0.67|99.00
Sawed-Off | Highwayman (Factory New)|Restricted|488|Sawed-Off|0.17|0.07|14.00
SCAR-20 | Cardiac (Factory New)|Classified|489|SCAR-20|0.17|0.08|13.00
UMP-45 | Delusion (Factory New)|Mil-Spec|490|UMP-45|0.17|0.41|255.00
XM1014 | Tranquility (Factory New)|Classified|491|XM1014|0.04|0.39|23.00
AK-47 | Cartel (Factory New)|Classified|492|AK-47|0.00|0.00|15.00
Desert Eagle | Naga (Factory New)|Restricted|494|Desert Eagle|0.13|0.15|60.00
Glock-18 | Catacombs (Factory New)|Mil-Spec|496|Glock-18|0.19|0.12|73.00
M249 | System Lock (Factory New)|Mil-Spec|497|M249|0.13|0.09|54.00
XM1014 | Quicksilver (Factory New)|Mil-Spec|498|XM1014|0.58|0.32|25.00
MAC-10 | Malachite (Factory New)|Restricted|499|MAC-10|0.09|0.11|84.00
MP9 | Deadly Poison (Factory New)|Mil-Spec|500|MP9|0.19|0.12|74.00
P250 | Muertos (Factory New)|Classified|501|P250|0.00|0.73|115.00
M4A4 | 龍王 (Dragon King) (Factory New)|Classified|502|M4A4|0.81|0.28|87.00
Sawed-Off | Serenity (Factory New)|Restricted|503|Sawed-Off|0.00|0.00|15.00
SCAR-20 | Grotto (Factory New)|Mil-Spec|504|SCAR-20|0.19|0.12|65.00
Dual Berettas | Urban Shock (Factory New)|Restricted|505|Dual Berettas|0.00|0.00|8.00
★ Gut Knife | Damascus Steel (Factory New)|Covert|506|Gut Knife|0.50|0.04|255.00
★ Gut Knife | Marble Fade (Factory New)|Covert|508|Gut Knife|0.01|0.87|61.00
★ Gut Knife | Tiger Tooth (Factory New)|Covert|509|Gut Knife|0.09|0.77|188.00
★ Gut Knife | Ultraviolet (Factory New)|Covert|511|Gut Knife|0.56|0.05|65.00
★ Flip Knife | Damascus Steel (Factory New)|Covert|512|Flip Knife|0.50|0.05|66.00
★ Flip Knife | Marble Fade (Factory New)|Covert|514|Flip Knife|0.00|0.00|38.00
★ Flip Knife | Tiger Tooth (Factory New)|Covert|515|Flip Knife|0.09|0.92|74.00
★ Flip Knife | Ultraviolet (Factory New)|Covert|517|Flip Knife|0.54|0.07|54.00
★ Bayonet | Damascus Steel (Factory New)|Covert|518|Bayonet|0.53|0.05|93.00
★ Bayonet | Marble Fade (Factory New)|Covert|520|Bayonet|0.17|0.02|44.00
★ Bayonet | Tiger Tooth (Factory New)|Covert|521|Bayonet|0.09|0.77|229.00
★ Bayonet | Ultraviolet (Factory New)|Covert|523|Bayonet|0.58|0.03|74.00
★ M9 Bayonet | Damascus Steel (Factory New)|Covert|524|M9 Bayonet|0.57|0.11|94.00
★ M9 Bayonet | Marble Fade (Factory New)|Covert|526|M9 Bayonet|0.00|0.00|44.00
★ M9 Bayonet | Tiger Tooth (Factory New)|Covert|527|M9 Bayonet|0.13|0.67|255.00
★ M9 Bayonet | Ultraviolet (Factory New)|Covert|529|M9 Bayonet|0.58|0.10|59.00
★ Karambit | Damascus Steel (Factory New)|Covert|530|Karambit|0.53|0.06|89.00
★ Karambit | Marble Fade (Factory New)|Covert|532|Karambit|0.53|0.06|88.00
★ Karambit | Tiger Tooth (Factory New)|Covert|533|Karambit|0.17|0.53|255.00
★ Karambit | Ultraviolet (Factory New)|Covert|535|Karambit|0.57|0.14|118.00
MAC-10 | Neon Rider (Factory New)|Covert|536|MAC-10|0.83|0.18|94.00
M4A1-S | Hyper Beast (Factory New)|Covert|537|M4A1-S|0.56|0.45|66.00
FAMAS | Djinn (Factory New)|Classified|538|FAMAS|0.17|0.10|31.00
CZ75-Auto | Pole Position (Factory New)|Restricted|542|CZ75-Auto|0.52|0.16|67.00
MAG-7 | Heat (Factory New)|Restricted|543|MAG-7|0.09|0.24|62.00
AWP | Worm God (Factory New)|Restricted|544|AWP|0.17|0.09|33.00
Sawed-Off | Origami (Factory New)|Mil-Spec|545|Sawed-Off|0.08|0.71|131.00
P250 | Valence (Factory New)|Mil-Spec|547|P250|0.08|0.07|28.00
Desert Eagle | Bronze Deco (Factory New)|Mil-Spec|548|Desert Eagle|0.10|0.65|51.00
MP7 | Armor Core (Factory New)|Mil-Spec|549|MP7|0.21|0.13|30.00
AK-47 | Elite Build (Factory New)|Mil-Spec|550|AK-47|0.11|0.09|33.00
AWP | Hyper Beast (Factory New)|Covert|551|AWP|0.55|0.32|66.00
AK-47 | Aquamarine Revenge (Factory New)|Covert|552|AK-47|0.17|0.06|31.00
SG 553 | Cyrex (Factory New)|Classified|553|SG 553|0.01|0.67|89.00
MP7 | Nemesis (Factory New)|Classified|554|MP7|0.08|0.12|52.00
CZ75-Auto | Yellow Jacket (Factory New)|Classified|555|CZ75-Auto|0.10|0.11|63.00
P2000 | Handgun (Factory New)|Restricted|556|P2000|0.08|0.10|62.00
MP9 | Ruby Poison Dart (Factory New)|Restricted|558|MP9|0.94|0.29|31.00
M4A4 | Evil Daimyo (Factory New)|Restricted|559|M4A4|0.00|0.00|10.00
FAMAS | Neural Net (Factory New)|Restricted|560|FAMAS|0.58|0.08|24.00
USP-S | Torque (Factory New)|Mil-Spec|561|USP-S|0.10|0.10|67.00
UMP-45 | Riot (Factory New)|Mil-Spec|562|UMP-45|0.09|0.11|84.00
P90 | Elite Build (Factory New)|Mil-Spec|563|P90|0.00|0.00|15.00
Nova | Ranger (Factory New)|Mil-Spec|564|Nova|0.08|0.13|15.00
Glock-18 | Bunsen Burner (Factory New)|Mil-Spec|565|Glock-18|0.19|0.12|73.00
Galil AR | Rocket Pop (Factory New)|Mil-Spec|566|Galil AR|0.58|0.38|105.00
SCAR-20 | Army Sheen (Factory New)|Consumer Grade|567|SCAR-20|0.10|0.36|44.00
CZ75-Auto | Army Sheen (Factory New)|Consumer Grade|568|CZ75-Auto|0.31|0.23|30.00
M249 | Impact Drill (Factory New)|Consumer Grade|569|M249|0.09|0.92|91.00
MAG-7 | Seabird (Factory New)|Consumer Grade|570|MAG-7|0.50|0.25|89.00
Desert Eagle | Night (Factory New)|Industrial Grade|571|Desert Eagle|0.58|0.04|55.00
Galil AR | Urban Rubble (Factory New)|Industrial Grade|572|Galil AR|0.21|0.14|56.00
USP-S | Para Green (Factory New)|Industrial Grade|573|USP-S|0.09|0.11|82.00
MAC-10 | Fade (Factory New)|Mil-Spec|574|MAC-10|0.10|0.11|62.00
P250 | Whiteout (Factory New)|Mil-Spec|575|P250|0.14|0.09|255.00
MP7 | Full Stop (Factory New)|Mil-Spec|576|MP7|0.05|0.40|53.00
Five-SeveN | Nitro (Factory New)|Mil-Spec|577|Five-SeveN|0.13|0.10|92.00
CZ75-Auto | Emerald (Factory New)|Mil-Spec|578|CZ75-Auto|0.40|0.93|42.00
SG 553 | Bulldozer (Factory New)|Restricted|579|SG 553|0.19|0.12|73.00
Dual Berettas | Duelist (Factory New)|Restricted|580|Dual Berettas|0.08|0.12|16.00
Glock-18 | Twilight Galaxy (Factory New)|Classified|581|Glock-18|0.10|0.11|63.00
M4A1-S | Hot Rod (Factory New)|Classified|582|M4A1-S|0.00|0.88|42.00
MP7 | Asterion (Factory New)|Consumer Grade|583|MP7|0.67|0.56|82.00
AUG | Daedalus (Factory New)|Consumer Grade|584|AUG|0.19|0.12|75.00
Dual Berettas | Moon in Libra (Factory New)|Consumer Grade|585|Dual Berettas|0.64|0.68|22.00
Nova | Moon in Libra (Factory New)|Consumer Grade|586|Nova|0.64|0.61|90.00
Tec-9 | Hades (Factory New)|Industrial Grade|587|Tec-9|0.11|0.10|144.00
P2000 | Pathfinder (Factory New)|Industrial Grade|588|P2000|0.10|0.11|46.00
AWP | Sun in Leo (Factory New)|Industrial Grade|589|AWP|0.63|0.61|74.00
M249 | Shipping Forecast (Factory New)|Industrial Grade|590|M249|0.61|0.39|76.00
UMP-45 | Minotaur's Labyrinth (Factory New)|Mil-Spec|591|UMP-45|0.10|0.11|64.00
MP9 | Pandora's Box (Factory New)|Mil-Spec|592|MP9|0.02|0.11|61.00
G3SG1 | Chronos (Factory New)|Restricted|593|G3SG1|0.10|0.09|58.00
M4A1-S | Icarus Fell (Factory New)|Restricted|594|M4A1-S|0.62|0.53|74.00
M4A4 | Poseidon (Factory New)|Classified|595|M4A4|0.10|0.11|89.00
AWP | Medusa (Factory New)|Covert|596|AWP|0.58|0.29|14.00
PP-Bizon | Bamboo Print (Factory New)|Consumer Grade|597|PP-Bizon|0.09|0.25|53.00
Sawed-Off | Bamboo Shadow (Factory New)|Consumer Grade|598|Sawed-Off|0.61|0.06|47.00
Tec-9 | Bamboo Forest (Factory New)|Consumer Grade|599|Tec-9|0.07|0.40|52.00
G3SG1 | Orange Kimono (Factory New)|Consumer Grade|600|G3SG1|0.08|0.09|68.00
P250 | Mint Kimono (Factory New)|Consumer Grade|601|P250|0.10|0.11|64.00
P250 | Crimson Kimono (Factory New)|Industrial Grade|602|P250|0.03|0.23|64.00
Desert Eagle | Midnight Storm (Factory New)|Industrial Grade|603|Desert Eagle|0.46|0.40|45.00
Galil AR | Aqua Terrace (Factory New)|Mil-Spec|604|Galil AR|0.17|0.07|15.00
MAG-7 | Counter Terrace (Factory New)|Mil-Spec|605|MAG-7|0.08|0.11|54.00
Tec-9 | Terrace (Factory New)|Mil-Spec|606|Tec-9|0.14|0.90|255.00
Five-SeveN | Neon Kimono (Factory New)|Restricted|607|Five-SeveN|0.14|0.23|141.00
Desert Eagle | Sunset Storm 壱 (Factory New)|Restricted|608|Desert Eagle|0.00|0.73|51.00
Desert Eagle | Sunset Storm 弐 (Factory New)|Restricted|609|Desert Eagle|0.00|0.73|51.00
M4A4 | Daybreak (Factory New)|Restricted|610|M4A4|0.10|0.11|65.00
AK-47 | Hydroponic (Factory New)|Classified|611|AK-47|0.11|0.18|49.00
AUG | Akihabara Accept (Factory New)|Covert|612|AUG|0.11|0.08|38.00
★ Falchion Knife | Vanilla (Factory New)|Covert|613|Falchion Knife|0.58|0.09|22.00
★ Falchion Knife | Blue Steel (Factory New)|Covert|614|Falchion Knife|0.33|0.04|68.00
★ Falchion Knife | Boreal Forest (Factory New)|Covert|615|Falchion Knife|0.37|0.38|133.00
★ Falchion Knife | Case Hardened (Factory New)|Covert|616|Falchion Knife|0.33|0.04|68.00
★ Falchion Knife | Crimson Web (Factory New)|Covert|617|Falchion Knife|0.01|0.72|172.00
★ Falchion Knife | Fade (Factory New)|Covert|618|Falchion Knife|0.09|0.17|90.00
★ Falchion Knife | Forest DDPAT (Factory New)|Covert|619|Falchion Knife|0.09|0.24|95.00
★ Falchion Knife | Night (Factory New)|Covert|620|Falchion Knife|0.57|0.11|81.00
★ Falchion Knife | Safari Mesh (Factory New)|Covert|621|Falchion Knife|0.16|0.25|150.00
★ Falchion Knife | Scorched (Factory New)|Covert|622|Falchion Knife|0.92|0.05|43.00
★ Falchion Knife | Slaughter (Factory New)|Covert|623|Falchion Knife|0.33|0.04|68.00
★ Falchion Knife | Stained (Factory New)|Covert|624|Falchion Knife|0.33|0.04|68.00
★ Falchion Knife | Urban Masked (Factory New)|Covert|625|Falchion Knife|0.28|0.04|205.00
Dual Berettas | Dualing Dragons (Factory New)|Mil-Spec|626|Dual Berettas|0.00|0.00|9.00
FAMAS | Survivor Z (Factory New)|Mil-Spec|627|FAMAS|0.19|0.12|77.00
Glock-18 | Wraiths (Factory New)|Mil-Spec|628|Glock-18|0.10|0.11|65.00
MAC-10 | Rangeen (Factory New)|Mil-Spec|629|MAC-10|0.08|0.10|116.00
MAG-7 | Cobalt Core (Factory New)|Mil-Spec|630|MAG-7|0.58|0.25|16.00
SCAR-20 | Green Marine (Factory New)|Mil-Spec|631|SCAR-20|0.17|0.08|13.00
XM1014 | Scumbria (Factory New)|Mil-Spec|632|XM1014|0.08|0.10|62.00
Galil AR | Stone Cold (Factory New)|Restricted|633|Galil AR|0.17|0.07|15.00
M249 | Nebula Crusader (Factory New)|Restricted|634|M249|0.63|0.41|22.00
MP7 | Special Delivery (Factory New)|Restricted|635|MP7|0.08|0.12|16.00
P250 | Wingshot (Factory New)|Restricted|636|P250|0.08|0.11|55.00
AK-47 | Frontside Misty (Factory New)|Classified|637|AK-47|0.08|0.13|15.00
G3SG1 | Flux (Factory New)|Classified|638|G3SG1|0.67|0.17|41.00
SSG 08 | Big Iron (Factory New)|Classified|639|SSG 08|0.17|0.07|14.00
M4A1-S | Golden Coil (Factory New)|Covert|640|M4A1-S|0.06|0.18|50.00
USP-S | Kill Confirmed (Factory New)|Covert|641|USP-S|0.02|0.38|26.00
★ Shadow Daggers | Vanilla (Factory New)|Covert|642|Shadow Daggers|0.50|0.21|14.00
★ Shadow Daggers | Blue Steel (Factory New)|Covert|643|Shadow Daggers|0.50|0.06|255.00
★ Shadow Daggers | Boreal Forest (Factory New)|Covert|644|Shadow Daggers|0.17|0.11|109.00
★ Shadow Daggers | Case Hardened (Factory New)|Covert|645|Shadow Daggers|0.17|0.02|255.00
★ Shadow Daggers | Crimson Web (Factory New)|Covert|646|Shadow Daggers|0.50|0.05|106.00
★ Shadow Daggers | Fade (Factory New)|Covert|647|Shadow Daggers|0.83|0.05|255.00
★ Shadow Daggers | Forest DDPAT (Factory New)|Covert|648|Shadow Daggers|0.30|0.29|100.00
★ Shadow Daggers | Night (Factory New)|Covert|649|Shadow Daggers|0.55|0.25|93.00
★ Shadow Daggers | Safari Mesh (Factory New)|Covert|650|Shadow Daggers|0.21|0.15|105.00
★ Shadow Daggers | Scorched (Factory New)|Covert|651|Shadow Daggers|0.58|0.03|69.00
★ Shadow Daggers | Slaughter (Factory New)|Covert|652|Shadow Daggers|0.83|0.02|255.00
★ Shadow Daggers | Stained (Factory New)|Covert|653|Shadow Daggers|0.50|0.01|255.00
★ Shadow Daggers | Urban Masked (Factory New)|Covert|654|Shadow Daggers|0.44|0.05|173.00
R8 Revolver | Fade (Factory New)|Covert|655|R8 Revolver|0.08|0.76|62.00
M4A4 | Royal Paladin (Factory New)|Covert|656|M4A4|0.09|0.11|96.00
R8 Revolver | Crimson Web (Factory New)|Mil-Spec|657|R8 Revolver|0.01|0.79|145.00
AUG | Ricochet (Factory New)|Mil-Spec|658|AUG|0.12|0.09|43.00
Desert Eagle | Corinthian (Factory New)|Mil-Spec|659|Desert Eagle|0.06|0.56|34.00
P2000 | Imperial (Factory New)|Mil-Spec|660|P2000|0.99|0.69|58.00
Sawed-Off | Yorick (Factory New)|Mil-Spec|661|Sawed-Off|0.12|0.65|48.00
SCAR-20 | Outbreak (Factory New)|Mil-Spec|662|SCAR-20|0.28|0.27|37.00
PP-Bizon | Fuel Rod (Factory New)|Restricted|663|PP-Bizon|0.25|0.33|6.00
Negev | Power Loader (Factory New)|Restricted|664|Negev|0.08|0.24|72.00
Five-SeveN | Retrobution (Factory New)|Restricted|665|Five-SeveN|0.17|0.13|255.00
SG 553 | Tiger Moth (Factory New)|Restricted|666|SG 553|0.03|0.62|32.00
Tec-9 | Avalanche (Factory New)|Restricted|667|Tec-9|0.00|0.00|4.00
XM1014 | Teclu Burner (Factory New)|Restricted|668|XM1014|0.08|0.10|62.00
AK-47 | Point Disarray (Factory New)|Classified|669|AK-47|0.00|0.00|38.00
P90 | Shapewood (Factory New)|Classified|670|P90|0.18|0.11|92.00
R8 Revolver | Amber Fade (Factory New)|Classified|672|R8 Revolver|0.22|0.40|42.00
Souvenir R8 Revolver | Amber Fade (Factory New)|Classified|672|R8 Revolver|0.22|0.40|42.00
R8 Revolver | Bone Mask (Factory New)|Consumer Grade|673|R8 Revolver|0.12|0.31|13.00
Souvenir R8 Revolver | Bone Mask (Factory New)|Consumer Grade|673|R8 Revolver|0.12|0.31|13.00
PP-Bizon | Photic Zone (Factory New)|Mil-Spec|674|PP-Bizon|0.48|0.53|79.00
Dual Berettas | Cartel (Factory New)|Mil-Spec|675|Dual Berettas|0.11|0.12|26.00
MAC-10 | Lapis Gator (Factory New)|Mil-Spec|676|MAC-10|0.09|0.11|84.00
SSG 08 | Necropos (Factory New)|Mil-Spec|677|SSG 08|0.17|0.07|15.00
Tec-9 | Jambiya (Factory New)|Mil-Spec|678|Tec-9|0.00|0.00|4.00
USP-S | Lead Conduit (Factory New)|Mil-Spec|679|USP-S|0.17|0.07|15.00
FAMAS | Valence (Factory New)|Restricted|680|FAMAS|0.44|0.12|25.00
Five-SeveN | Triumvirate (Factory New)|Restricted|681|Five-SeveN|0.10|0.11|66.00
Glock-18 | Royal Legion (Factory New)|Restricted|682|Glock-18|0.21|0.16|44.00
MAG-7 | Praetorian (Factory New)|Restricted|683|MAG-7|0.67|0.12|8.00
MP7 | Impire (Factory New)|Restricted|684|MP7|0.23|0.46|136.00
AWP | Elite Build (Factory New)|Classified|685|AWP|0.17|0.07|14.00
Desert Eagle | Kumicho Dragon (Factory New)|Classified|686|Desert Eagle|0.50|0.16|50.00
Nova | Hyper Beast (Factory New)|Classified|687|Nova|0.75|0.12|17.00
AK-47 | Fuel Injector (Factory New)|Covert|688|AK-47|0.14|0.11|56.00
M4A4 | The Battlestar (Factory New)|Covert|689|M4A4|0.00|0.00|9.00
★ Bowie Knife | Vanilla (Factory New)|Covert|690|Bowie Knife|0.58|0.03|63.00
★ Bowie Knife | Blue Steel (Factory New)|Covert|691|Bowie Knife|0.00|0.00|39.00
★ Bowie Knife | Boreal Forest (Factory New)|Covert|692|Bowie Knife|0.15|0.14|112.00
★ Bowie Knife | Case Hardened (Factory New)|Covert|693|Bowie Knife|0.44|0.07|41.00
★ Bowie Knife | Crimson Web (Factory New)|Covert|694|Bowie Knife|0.00|0.56|149.00
★ Bowie Knife | Fade (Factory New)|Covert|695|Bowie Knife|0.42|0.05|44.00
★ Bowie Knife | Forest DDPAT (Factory New)|Covert|696|Bowie Knife|0.29|0.31|105.00
★ Bowie Knife | Night (Factory New)|Covert|697|Bowie Knife|0.58|0.16|75.00
★ Bowie Knife | Safari Mesh (Factory New)|Covert|698|Bowie Knife|0.19|0.19|131.00
★ Bowie Knife | Scorched (Factory New)|Covert|699|Bowie Knife|0.00|0.00|39.00
★ Bowie Knife | Slaughter (Factory New)|Covert|700|Bowie Knife|0.44|0.07|41.00
★ Bowie Knife | Stained (Factory New)|Covert|701|Bowie Knife|0.42|0.05|44.00
★ Bowie Knife | Urban Masked (Factory New)|Covert|702|Bowie Knife|0.48|0.06|178.00
AUG | Fleet Flock (Factory New)|Classified|703|AUG|0.11|0.14|22.00
PP-Bizon | Judgement of Anubis (Factory New)|Covert|704|PP-Bizon|0.00|0.00|3.00
CZ75-Auto | Red Astor (Factory New)|Restricted|705|CZ75-Auto|0.39|0.12|25.00
Dual Berettas | Ventilators (Factory New)|Mil-Spec|706|Dual Berettas|0.00|0.00|14.00
G3SG1 | Orange Crash (Factory New)|Mil-Spec|707|G3SG1|0.07|0.82|255.00
Galil AR | Firefight (Factory New)|Restricted|708|Galil AR|0.42|0.12|17.00
M249 | Spectre (Factory New)|Mil-Spec|709|M249|0.56|0.03|92.00
M4A1-S | Chantico's Fire (Factory New)|Covert|710|M4A1-S|0.17|0.35|255.00
MP9 | Bioleak (Factory New)|Mil-Spec|711|MP9|0.15|0.74|46.00
P2000 | Oceanic (Factory New)|Mil-Spec|712|P2000|0.70|0.15|61.00
SG 553 | Atlas (Factory New)|Mil-Spec|715|SG 553|0.22|0.25|12.00
SSG 08 | Ghost Crusader (Factory New)|Restricted|716|SSG 08|0.17|0.07|15.00
Tec-9 | Re-Entry (Factory New)|Restricted|717|Tec-9|0.50|0.04|56.00
UMP-45 | Primal Saber (Factory New)|Classified|718|UMP-45|0.19|0.12|65.00
XM1014 | Black Tie (Factory New)|Restricted|719|XM1014|0.17|0.07|14.00
M4A1-S | Mecha Industries (Factory New)|Covert|720|M4A1-S|0.14|0.13|148.00
Glock-18 | Wasteland Rebel (Factory New)|Covert|721|Glock-18|0.14|0.09|223.00
SCAR-20 | Bloodsport (Factory New)|Classified|722|SCAR-20|0.17|0.08|24.00
P2000 | Imperial Dragon (Factory New)|Classified|723|P2000|0.05|0.84|56.00
M4A4 | Desolate Space (Factory New)|Classified|724|M4A4|0.65|0.39|255.00
Sawed-Off | Limelight (Factory New)|Restricted|725|Sawed-Off|0.10|0.10|100.00
R8 Revolver | Reboot (Factory New)|Restricted|726|R8 Revolver|0.17|0.09|11.00
P90 | Chopper (Factory New)|Restricted|727|P90|0.11|0.23|13.00
AWP | Phobos (Factory New)|Restricted|728|AWP|0.17|0.07|29.00
AUG | Aristocrat (Factory New)|Restricted|729|AUG|0.60|0.45|31.00
Tec-9 | Ice Cap (Factory New)|Mil-Spec|730|Tec-9|0.50|0.04|56.00
SG 553 | Aerial (Factory New)|Mil-Spec|731|SG 553|0.11|0.09|32.00
PP-Bizon | Harvester (Factory New)|Mil-Spec|732|PP-Bizon|0.12|0.25|16.00
P250 | Iron Clad (Factory New)|Mil-Spec|733|P250|0.19|0.46|26.00
Nova | Exo (Factory New)|Mil-Spec|734|Nova|0.42|0.12|50.00
MAC-10 | Carnivore (Factory New)|Mil-Spec|735|MAC-10|0.09|0.11|84.00
Five-SeveN | Violent Daimyo (Factory New)|Mil-Spec|736|Five-SeveN|0.87|0.53|77.00
★ Bayonet | Lore (Factory New)|Covert|737|Bayonet|0.17|0.48|255.00
★ Flip Knife | Lore (Factory New)|Covert|738|Flip Knife|0.00|0.00|38.00
★ Gut Knife | Lore (Factory New)|Covert|739|Gut Knife|0.17|0.52|255.00
★ Karambit | Lore (Factory New)|Covert|740|Karambit|0.17|0.53|255.00
★ M9 Bayonet | Lore (Factory New)|Covert|741|M9 Bayonet|0.08|0.69|148.00
★ Bayonet | Black Laminate (Factory New)|Covert|742|Bayonet|0.17|0.02|86.00
★ Flip Knife | Black Laminate (Factory New)|Covert|743|Flip Knife|0.08|0.04|45.00
★ Gut Knife | Black Laminate (Factory New)|Covert|744|Gut Knife|0.56|0.04|67.00
★ Karambit | Black Laminate (Factory New)|Covert|745|Karambit|0.54|0.05|81.00
★ M9 Bayonet | Black Laminate (Factory New)|Covert|746|M9 Bayonet|0.50|0.04|48.00
★ Bayonet | Autotronic (Factory New)|Covert|752|Bayonet|0.99|0.80|159.00
★ Flip Knife | Autotronic (Factory New)|Covert|753|Flip Knife|1.00|0.72|112.00
★ Gut Knife | Autotronic (Factory New)|Covert|754|Gut Knife|1.00|0.80|84.00
★ Karambit | Autotronic (Factory New)|Covert|755|Karambit|0.54|0.06|71.00
★ M9 Bayonet | Autotronic (Factory New)|Covert|756|M9 Bayonet|1.00|0.82|83.00
★ Bayonet | Bright Water (Factory New)|Covert|757|Bayonet|0.48|0.13|181.00
★ Flip Knife | Bright Water (Factory New)|Covert|758|Flip Knife|0.60|0.52|127.00
★ Gut Knife | Bright Water (Factory New)|Covert|759|Gut Knife|0.63|0.59|117.00
★ Karambit | Bright Water (Factory New)|Covert|760|Karambit|0.61|0.24|78.00
★ M9 Bayonet | Bright Water (Factory New)|Covert|761|M9 Bayonet|0.52|0.17|190.00
★ Bayonet | Freehand (Factory New)|Covert|762|Bayonet|0.50|0.00|255.00
★ Flip Knife | Freehand (Factory New)|Covert|763|Flip Knife|0.00|0.00|38.00
★ Gut Knife | Freehand (Factory New)|Covert|764|Gut Knife|0.45|0.07|95.00
★ Karambit | Freehand (Factory New)|Covert|765|Karambit|0.53|0.06|89.00
★ M9 Bayonet | Freehand (Factory New)|Covert|766|M9 Bayonet|0.71|0.49|140.00
AK-47 | Neon Revolution (Factory New)|Covert|767|AK-47|0.20|0.14|72.00
AUG | Syd Mead (Factory New)|Classified|768|AUG|0.11|0.13|23.00
CZ75-Auto | Imprint (Factory New)|Mil-Spec|769|CZ75-Auto|0.17|0.02|255.00
Desert Eagle | Directive (Factory New)|Restricted|770|Desert Eagle|0.08|0.12|17.00
FAMAS | Roll Cage (Factory New)|Covert|771|FAMAS|0.11|0.10|30.00
Five-SeveN | Scumbria (Factory New)|Mil-Spec|772|Five-SeveN|0.23|0.09|58.00
G3SG1 | Ventilator (Factory New)|Mil-Spec|773|G3SG1|0.19|0.13|54.00
Glock-18 | Weasel (Factory New)|Restricted|774|Glock-18|0.04|0.25|60.00
MAG-7 | Petroglyph (Factory New)|Restricted|775|MAG-7|0.17|0.12|16.00
MP9 | Airlock (Factory New)|Classified|776|MP9|0.11|0.20|184.00
P90 | Grim (Factory New)|Mil-Spec|778|P90|0.18|0.11|87.00
SCAR-20 | Powercore (Factory New)|Restricted|779|SCAR-20|0.32|0.52|21.00
SG 553 | Triarch (Factory New)|Restricted|780|SG 553|0.17|0.07|15.00
Tec-9 | Fuel Injector (Factory New)|Classified|781|Tec-9|0.12|0.11|74.00
UMP-45 | Briefing (Factory New)|Mil-Spec|782|UMP-45|0.20|0.14|65.00
XM1014 | Slipstream (Factory New)|Mil-Spec|783|XM1014|0.10|0.11|61.00
CZ75-Auto | Polymer (Factory New)|Mil-Spec|784|CZ75-Auto|0.17|0.09|45.00
Glock-18 | Ironwork (Factory New)|Mil-Spec|785|Glock-18|0.19|0.12|73.00
MP7 | Cirrus (Factory New)|Mil-Spec|786|MP7|0.17|0.07|14.00
Galil AR | Black Sand (Factory New)|Mil-Spec|787|Galil AR|0.10|0.12|59.00
MP9 | Sand Scale (Factory New)|Mil-Spec|788|MP9|0.02|0.11|61.00
MAG-7 | Sonar (Factory New)|Mil-Spec|789|MAG-7|0.14|0.29|70.00
P2000 | Turf (Factory New)|Mil-Spec|790|P2000|0.21|0.77|92.00
Dual Berettas | Royal Consorts (Factory New)|Restricted|791|Dual Berettas|0.17|0.10|10.00
G3SG1 | Stinger (Factory New)|Restricted|792|G3SG1|0.17|0.11|19.00
M4A1-S | Flashback (Factory New)|Restricted|793|M4A1-S|0.33|0.03|35.00
Nova | Gila (Factory New)|Restricted|794|Nova|0.42|0.12|50.00
USP-S | Cyrex (Factory New)|Restricted|795|USP-S|0.08|0.11|53.00
FAMAS | Mecha Industries (Factory New)|Classified|796|FAMAS|0.14|0.12|175.00
P90 | Shallow Grave (Factory New)|Classified|797|P90|0.83|0.11|9.00
Sawed-Off | Wasteland Princess (Factory New)|Classified|798|Sawed-Off|0.00|0.00|15.00
SSG 08 | Dragonfire (Factory New)|Covert|799|SSG 08|0.17|0.07|14.00
M4A4 | Buzz Kill (Factory New)|Covert|800|M4A4|0.17|0.14|7.00
PP-Bizon | Jungle Slipstream (Factory New)|Mil-Spec|801|PP-Bizon|0.11|0.11|53.00
SCAR-20 | Blueprint (Factory New)|Mil-Spec|802|SCAR-20|0.00|0.00|15.00
Desert Eagle | Oxide Blaze (Factory New)|Mil-Spec|803|Desert Eagle|0.17|0.11|45.00
Five-SeveN | Capillary (Factory New)|Mil-Spec|804|Five-SeveN|0.38|0.18|62.00
MP7 | Akoben (Factory New)|Mil-Spec|805|MP7|0.52|0.52|110.00
P250 | Ripple (Factory New)|Mil-Spec|806|P250|0.08|0.07|28.00
Sawed-Off | Zander (Factory New)|Mil-Spec|807|Sawed-Off|0.17|0.38|13.00
Galil AR | Crimson Tsunami (Factory New)|Restricted|808|Galil AR|0.25|0.02|96.00
M249 | Emerald Poison Dart (Factory New)|Restricted|809|M249|0.11|0.11|56.00
MAC-10 | Last Dive (Factory New)|Restricted|810|MAC-10|0.10|0.11|62.00
UMP-45 | Scaffold (Factory New)|Restricted|811|UMP-45|0.47|0.33|79.00
XM1014 | Seasons (Factory New)|Restricted|812|XM1014|0.11|0.09|34.00
AWP | Fever Dream (Factory New)|Classified|813|AWP|0.10|0.09|55.00
CZ75-Auto | Xiangliu (Factory New)|Classified|814|CZ75-Auto|0.99|0.31|45.00
M4A1-S | Decimator (Factory New)|Classified|815|M4A1-S|0.78|0.23|13.00
AK-47 | Bloodsport (Factory New)|Covert|816|AK-47|0.02|0.83|76.00
USP-S | Neo-Noir (Factory New)|Covert|817|USP-S|0.02|0.26|53.00
★ Bowie Knife | Damascus Steel (Factory New)|Covert|818|Bowie Knife|0.44|0.07|41.00
★ Bowie Knife | Marble Fade (Factory New)|Covert|820|Bowie Knife|0.02|0.89|92.00
★ Bowie Knife | Tiger Tooth (Factory New)|Covert|821|Bowie Knife|0.11|0.71|255.00
★ Bowie Knife | Ultraviolet (Factory New)|Covert|823|Bowie Knife|0.57|0.11|66.00
★ Butterfly Knife | Damascus Steel (Factory New)|Covert|824|Butterfly Knife|0.58|0.05|42.00
★ Butterfly Knife | Marble Fade (Factory New)|Covert|826|Butterfly Knife|0.58|0.05|42.00
★ Butterfly Knife | Tiger Tooth (Factory New)|Covert|827|Butterfly Knife|0.08|0.94|50.00
★ Butterfly Knife | Ultraviolet (Factory New)|Covert|829|Butterfly Knife|0.42|0.08|48.00
★ Falchion Knife | Damascus Steel (Factory New)|Covert|830|Falchion Knife|0.33|0.04|68.00
★ Falchion Knife | Marble Fade (Factory New)|Covert|832|Falchion Knife|0.33|0.04|68.00
★ Falchion Knife | Tiger Tooth (Factory New)|Covert|833|Falchion Knife|0.10|0.74|255.00
★ Falchion Knife | Ultraviolet (Factory New)|Covert|835|Falchion Knife|0.89|0.05|58.00
★ Huntsman Knife | Damascus Steel (Factory New)|Covert|836|Huntsman Knife|0.50|0.03|255.00
★ Huntsman Knife | Marble Fade (Factory New)|Covert|838|Huntsman Knife|0.50|0.05|38.00
★ Huntsman Knife | Tiger Tooth (Factory New)|Covert|839|Huntsman Knife|0.13|0.66|255.00
★ Huntsman Knife | Ultraviolet (Factory New)|Covert|841|Huntsman Knife|0.50|0.04|67.00
★ Shadow Daggers | Damascus Steel (Factory New)|Covert|842|Shadow Daggers|0.50|0.03|255.00
★ Shadow Daggers | Marble Fade (Factory New)|Covert|844|Shadow Daggers|0.17|0.03|255.00
★ Shadow Daggers | Tiger Tooth (Factory New)|Covert|845|Shadow Daggers|0.17|0.67|255.00
★ Shadow Daggers | Ultraviolet (Factory New)|Covert|847|Shadow Daggers|0.56|0.11|74.00
USP-S | Blueprint (Factory New)|Mil-Spec|848|USP-S|0.58|0.21|57.00
FAMAS | Macabre (Factory New)|Mil-Spec|849|FAMAS|0.13|0.31|181.00
M4A1-S | Briefing (Factory New)|Mil-Spec|850|M4A1-S|0.09|0.11|84.00
MAC-10 | Aloha (Factory New)|Mil-Spec|851|MAC-10|0.09|0.11|84.00
MAG-7 | Hard Water (Factory New)|Mil-Spec|852|MAG-7|0.41|0.15|73.00
Tec-9 | Cut Out (Factory New)|Mil-Spec|853|Tec-9|0.50|0.04|56.00
UMP-45 | Metal Flowers (Factory New)|Mil-Spec|854|UMP-45|0.10|0.11|64.00
AK-47 | Orbit Mk01 (Factory New)|Restricted|855|AK-47|0.11|0.07|42.00
P2000 | Woodsman (Factory New)|Restricted|856|P2000|0.04|0.85|71.00
P250 | Red Rock (Factory New)|Restricted|857|P250|0.17|0.09|22.00
P90 | Death Grip (Factory New)|Restricted|858|P90|0.08|0.11|56.00
SSG 08 | Death's Head (Factory New)|Restricted|859|SSG 08|0.07|0.11|46.00
Dual Berettas | Cobra Strike (Factory New)|Classified|860|Dual Berettas|0.12|0.27|15.00
Galil AR | Sugar Rush (Factory New)|Classified|861|Galil AR|0.00|0.00|4.00
M4A4 | Hellfire (Factory New)|Classified|862|M4A4|0.00|0.00|4.00
Five-SeveN | Hyper Beast (Factory New)|Covert|863|Five-SeveN|0.56|0.44|66.00
AWP | Oni Taiji (Factory New)|Covert|864|AWP|0.08|0.10|39.00
Sawed-Off | Morris (Factory New)|Mil-Spec|865|Sawed-Off|0.37|0.23|22.00
AUG | Triqua (Factory New)|Mil-Spec|866|AUG|0.17|0.09|11.00
G3SG1 | Hunter (Factory New)|Mil-Spec|867|G3SG1|0.11|0.17|18.00
Glock-18 | Off World (Factory New)|Mil-Spec|868|Glock-18|0.55|0.48|99.00
MAC-10 | Oceanic (Factory New)|Mil-Spec|869|MAC-10|0.58|0.06|36.00
Tec-9 | Cracked Opal (Factory New)|Mil-Spec|870|Tec-9|0.07|0.69|32.00
SCAR-20 | Jungle Slipstream (Factory New)|Mil-Spec|871|SCAR-20|0.17|0.60|255.00
MP9 | Goo (Factory New)|Restricted|872|MP9|0.11|0.11|53.00
SG 553 | Phantom (Factory New)|Restricted|873|SG 553|0.14|0.12|50.00
CZ75-Auto | Tacticat (Factory New)|Restricted|874|CZ75-Auto|0.29|0.08|48.00
UMP-45 | Exposure (Factory New)|Restricted|875|UMP-45|0.10|0.11|63.00
XM1014 | Ziggy (Factory New)|Restricted|876|XM1014|0.22|0.90|61.00
PP-Bizon | High Roller (Factory New)|Classified|877|PP-Bizon|0.01|0.76|116.00
M4A1-S | Leaded Glass (Factory New)|Classified|878|M4A1-S|0.08|0.33|6.00
R8 Revolver | Llama Cannon (Factory New)|Classified|879|R8 Revolver|0.62|0.57|14.00
AK-47 | The Empress (Factory New)|Covert|880|AK-47|0.55|0.54|26.00
P250 | See Ya Later (Factory New)|Covert|881|P250|0.31|0.47|124.00
PP-Bizon | Night Riot (Factory New)|Mil-Spec|882|PP-Bizon|0.00|0.00|3.00
Five-SeveN | Flame Test (Factory New)|Mil-Spec|883|Five-SeveN|0.08|0.11|56.00
MP9 | Black Sand (Factory New)|Mil-Spec|884|MP9|0.10|0.11|64.00
P2000 | Urban Hazard (Factory New)|Mil-Spec|885|P2000|0.03|0.42|130.00
R8 Revolver | Grip (Factory New)|Mil-Spec|886|R8 Revolver|0.00|0.00|9.00
SG 553 | Aloha (Factory New)|Mil-Spec|887|SG 553|0.92|0.04|55.00
XM1014 | Oxide Blaze (Factory New)|Mil-Spec|888|XM1014|0.17|0.09|11.00
Glock-18 | Moonrise (Factory New)|Restricted|889|Glock-18|0.19|0.12|73.00
Negev | Lionfish (Factory New)|Restricted|890|Negev|0.17|0.08|255.00
Nova | Wild Six (Factory New)|Restricted|891|Nova|0.17|0.10|20.00
MAG-7 | SWAG-7 (Factory New)|Restricted|892|MAG-7|0.17|0.09|23.00
UMP-45 | Arctic Wolf (Factory New)|Restricted|893|UMP-45|0.15|0.10|168.00
AUG | Stymphalian (Factory New)|Classified|894|AUG|0.11|0.13|23.00
AWP | Mortis (Factory New)|Classified|895|AWP|0.03|0.57|154.00
USP-S | Cortex (Factory New)|Classified|896|USP-S|0.13|0.26|54.00
M4A4 | Neo-Noir (Factory New)|Covert|897|M4A4|0.08|0.20|10.00
MP7 | Bloodsport (Factory New)|Covert|898|MP7|0.08|0.14|14.00
AUG | Amber Slipstream (Factory New)|Mil-Spec|899|AUG|0.07|0.81|255.00
Dual Berettas | Shred (Factory New)|Mil-Spec|900|Dual Berettas|0.00|0.00|10.00
Glock-18 | Warhawk (Factory New)|Mil-Spec|901|Glock-18|0.12|0.40|25.00
MP9 | Capillary (Factory New)|Mil-Spec|902|MP9|0.01|0.59|189.00
P90 | Traction (Factory New)|Mil-Spec|903|P90|0.17|0.11|9.00
R8 Revolver | Survivalist (Factory New)|Mil-Spec|904|R8 Revolver|0.22|0.20|15.00
Tec-9 | Snek-9 (Factory New)|Mil-Spec|905|Tec-9|0.00|0.00|4.00
CZ75-Auto | Eco (Factory New)|Restricted|906|CZ75-Auto|0.14|0.25|189.00
G3SG1 | High Seas (Factory New)|Restricted|907|G3SG1|0.17|0.05|19.00
Nova | Toy Soldier (Factory New)|Restricted|908|Nova|0.24|0.38|24.00
AWP | PAW (Factory New)|Restricted|909|AWP|0.17|0.09|33.00
MP7 | Powercore (Factory New)|Restricted|910|MP7|0.17|0.08|13.00
M4A1-S | Nightmare (Factory New)|Classified|911|M4A1-S|0.13|0.11|44.00
Sawed-Off | Devourer (Factory New)|Classified|912|Sawed-Off|0.93|0.30|135.00
FAMAS | Eye of Athena (Factory New)|Classified|913|FAMAS|0.08|0.45|137.00
AK-47 | Neon Rider (Factory New)|Covert|914|AK-47|0.17|0.14|7.00
Desert Eagle | Code Red (Factory New)|Covert|915|Desert Eagle|0.11|0.09|32.00
★ Stiletto Knife | Vanilla (Factory New)|Covert|916|Stiletto Knife|0.50|0.02|255.00
★ Stiletto Knife | Blue Steel (Factory New)|Covert|917|Stiletto Knife|0.58|0.33|12.00
★ Stiletto Knife | Boreal Forest (Factory New)|Covert|918|Stiletto Knife|0.14|0.16|119.00
★ Stiletto Knife | Case Hardened (Factory New)|Covert|919|Stiletto Knife|0.00|0.00|40.00
★ Stiletto Knife | Crimson Web (Factory New)|Covert|920|Stiletto Knife|0.01|0.72|170.00
★ Stiletto Knife | Fade (Factory New)|Covert|921|Stiletto Knife|0.08|0.70|96.00
★ Stiletto Knife | Forest DDPAT (Factory New)|Covert|922|Stiletto Knife|0.30|0.27|102.00
★ Stiletto Knife | Night Stripe (Factory New)|Covert|923|Stiletto Knife|0.58|0.22|91.00
★ Stiletto Knife | Safari Mesh (Factory New)|Covert|924|Stiletto Knife|0.25|0.15|107.00
★ Stiletto Knife | Scorched (Factory New)|Covert|925|Stiletto Knife|0.00|0.06|33.00
★ Stiletto Knife | Slaughter (Factory New)|Covert|926|Stiletto Knife|0.00|0.65|83.00
★ Stiletto Knife | Stained (Factory New)|Covert|927|Stiletto Knife|0.00|0.00|40.00
★ Stiletto Knife | Urban Masked (Factory New)|Covert|928|Stiletto Knife|0.31|0.05|140.00
★ Ursus Knife | Vanilla (Factory New)|Covert|929|Ursus Knife|0.58|0.07|28.00
★ Ursus Knife | Blue Steel (Factory New)|Covert|930|Ursus Knife|0.42|0.06|33.00
★ Ursus Knife | Boreal Forest (Factory New)|Covert|931|Ursus Knife|0.15|0.14|117.00
★ Ursus Knife | Case Hardened (Factory New)|Covert|932|Ursus Knife|0.17|0.00|255.00
★ Ursus Knife | Crimson Web (Factory New)|Covert|933|Ursus Knife|0.01|0.62|153.00
★ Ursus Knife | Fade (Factory New)|Covert|934|Ursus Knife|0.42|0.06|33.00
★ Ursus Knife | Forest DDPAT (Factory New)|Covert|935|Ursus Knife|0.29|0.31|111.00
★ Ursus Knife | Night Stripe (Factory New)|Covert|936|Ursus Knife|0.58|0.26|86.00
★ Ursus Knife | Safari Mesh (Factory New)|Covert|937|Ursus Knife|0.26|0.13|107.00
★ Ursus Knife | Scorched (Factory New)|Covert|938|Ursus Knife|0.00|0.00|40.00
★ Ursus Knife | Slaughter (Factory New)|Covert|939|Ursus Knife|0.42|0.06|33.00
★ Ursus Knife | Stained (Factory New)|Covert|940|Ursus Knife|0.50|0.00|255.00
★ Ursus Knife | Urban Masked (Factory New)|Covert|941|Ursus Knife|0.40|0.05|136.00
★ Navaja Knife | Vanilla (Factory New)|Covert|942|Navaja Knife|0.50|0.01|255.00
★ Navaja Knife | Blue Steel (Factory New)|Covert|943|Navaja Knife|0.58|0.30|37.00
★ Navaja Knife | Boreal Forest (Factory New)|Covert|944|Navaja Knife|0.13|0.17|124.00
★ Navaja Knife | Case Hardened (Factory New)|Covert|945|Navaja Knife|0.17|0.02|255.00
★ Navaja Knife | Crimson Web (Factory New)|Covert|946|Navaja Knife|0.33|0.03|77.00
★ Navaja Knife | Fade (Factory New)|Covert|947|Navaja Knife|0.09|0.15|85.00
★ Navaja Knife | Forest DDPAT (Factory New)|Covert|948|Navaja Knife|0.08|0.23|97.00
★ Navaja Knife | Night Stripe (Factory New)|Covert|949|Navaja Knife|0.57|0.24|92.00
★ Navaja Knife | Safari Mesh (Factory New)|Covert|950|Navaja Knife|0.25|0.13|106.00
★ Navaja Knife | Scorched (Factory New)|Covert|951|Navaja Knife|0.00|0.00|41.00
★ Navaja Knife | Slaughter (Factory New)|Covert|952|Navaja Knife|0.00|0.60|110.00
★ Navaja Knife | Stained (Factory New)|Covert|953|Navaja Knife|0.44|0.04|79.00
★ Navaja Knife | Urban Masked (Factory New)|Covert|954|Navaja Knife|0.26|0.03|201.00
★ Talon Knife | Vanilla (Factory New)|Covert|955|Talon Knife|0.12|0.19|173.00
★ Talon Knife | Blue Steel (Factory New)|Covert|956|Talon Knife|0.53|0.23|43.00
★ Talon Knife | Boreal Forest (Factory New)|Covert|957|Talon Knife|0.15|0.13|106.00
★ Talon Knife | Case Hardened (Factory New)|Covert|958|Talon Knife|0.13|0.14|177.00
★ Talon Knife | Crimson Web (Factory New)|Covert|959|Talon Knife|0.50|0.04|75.00
★ Talon Knife | Fade (Factory New)|Covert|960|Talon Knife|0.94|0.66|125.00
★ Talon Knife | Forest DDPAT (Factory New)|Covert|961|Talon Knife|0.30|0.30|102.00
★ Talon Knife | Night Stripe (Factory New)|Covert|962|Talon Knife|0.54|0.22|76.00
★ Talon Knife | Safari Mesh (Factory New)|Covert|963|Talon Knife|0.26|0.13|93.00
★ Talon Knife | Scorched (Factory New)|Covert|964|Talon Knife|0.11|0.11|135.00
★ Talon Knife | Slaughter (Factory New)|Covert|965|Talon Knife|0.99|0.59|178.00
★ Talon Knife | Stained (Factory New)|Covert|966|Talon Knife|0.50|0.02|255.00
★ Talon Knife | Urban Masked (Factory New)|Covert|967|Talon Knife|0.43|0.06|125.00
PP-Bizon | Facility Sketch (Factory New)|Consumer Grade|968|PP-Bizon|0.08|0.23|73.00
Souvenir PP-Bizon | Facility Sketch (Factory New)|Consumer Grade|968|PP-Bizon|0.08|0.23|73.00
P250 | Facility Draft (Factory New)|Consumer Grade|969|P250|0.77|0.09|57.00
Souvenir P250 | Facility Draft (Factory New)|Consumer Grade|969|P250|0.77|0.09|57.00
UMP-45 | Facility Dark (Factory New)|Consumer Grade|970|UMP-45|0.10|0.11|64.00
Souvenir UMP-45 | Facility Dark (Factory New)|Consumer Grade|970|UMP-45|0.10|0.11|64.00
Five-SeveN | Coolant (Factory New)|Consumer Grade|971|Five-SeveN|0.15|0.30|189.00
Souvenir Five-SeveN | Coolant (Factory New)|Consumer Grade|971|Five-SeveN|0.15|0.30|189.00
Nova | Mandrel (Factory New)|Consumer Grade|972|Nova|0.08|0.12|16.00
Souvenir Nova | Mandrel (Factory New)|Consumer Grade|972|Nova|0.08|0.12|16.00
M4A4 | Mainframe (Factory New)|Industrial Grade|973|M4A4|0.10|0.11|65.00
Souvenir M4A4 | Mainframe (Factory New)|Industrial Grade|973|M4A4|0.10|0.11|65.00
MP7 | Motherboard (Factory New)|Industrial Grade|974|MP7|0.98|0.14|59.00
Souvenir MP7 | Motherboard (Factory New)|Industrial Grade|974|MP7|0.98|0.14|59.00
Negev | Bulkhead (Factory New)|Industrial Grade|975|Negev|0.15|0.90|255.00
Souvenir Negev | Bulkhead (Factory New)|Industrial Grade|975|Negev|0.15|0.90|255.00
Galil AR | Cold Fusion (Factory New)|Industrial Grade|976|Galil AR|0.65|0.34|56.00
Souvenir Galil AR | Cold Fusion (Factory New)|Industrial Grade|976|Galil AR|0.65|0.34|56.00
P90 | Facility Negative (Factory New)|Mil-Spec|977|P90|0.10|0.11|66.00
Souvenir P90 | Facility Negative (Factory New)|Mil-Spec|977|P90|0.10|0.11|66.00
MP5-SD | Co-Processor (Factory New)|Mil-Spec|978|MP5-SD|0.17|0.10|20.00
Souvenir MP5-SD | Co-Processor (Factory New)|Mil-Spec|978|MP5-SD|0.17|0.10|20.00
P250 | Exchanger (Factory New)|Mil-Spec|979|P250|0.12|0.32|136.00
Souvenir P250 | Exchanger (Factory New)|Mil-Spec|979|P250|0.12|0.32|136.00
AWP | Acheron (Factory New)|Mil-Spec|980|AWP|0.65|0.33|58.00
Souvenir AWP | Acheron (Factory New)|Mil-Spec|980|AWP|0.65|0.33|58.00
AUG | Random Access (Factory New)|Restricted|981|AUG|0.10|0.21|33.00
Souvenir AUG | Random Access (Factory New)|Restricted|981|AUG|0.10|0.21|33.00
MAG-7 | Core Breach (Factory New)|Restricted|982|MAG-7|0.08|0.25|64.00
Souvenir MAG-7 | Core Breach (Factory New)|Restricted|982|MAG-7|0.08|0.25|64.00
Glock-18 | Nuclear Garden (Factory New)|Restricted|983|Glock-18|0.19|0.12|73.00
Souvenir Glock-18 | Nuclear Garden (Factory New)|Restricted|983|Glock-18|0.19|0.12|73.00
Tec-9 | Remote Control (Factory New)|Classified|984|Tec-9|0.00|0.00|3.00
Souvenir Tec-9 | Remote Control (Factory New)|Classified|984|Tec-9|0.00|0.00|3.00
M4A1-S | Control Panel (Factory New)|Classified|985|M4A1-S|0.17|0.07|15.00
Souvenir M4A1-S | Control Panel (Factory New)|Classified|985|M4A1-S|0.17|0.07|15.00
UMP-45 | Mudder (Factory New)|Consumer Grade|986|UMP-45|0.10|0.11|64.00
Souvenir UMP-45 | Mudder (Factory New)|Consumer Grade|986|UMP-45|0.10|0.11|64.00
MP5-SD | Dirt Drop (Factory New)|Consumer Grade|987|MP5-SD|0.10|0.22|23.00
Souvenir MP5-SD | Dirt Drop (Factory New)|Consumer Grade|987|MP5-SD|0.10|0.22|23.00
MP9 | Slide (Factory New)|Consumer Grade|988|MP9|0.05|0.11|63.00
Souvenir MP9 | Slide (Factory New)|Consumer Grade|988|MP9|0.05|0.11|63.00
AUG | Sweeper (Factory New)|Consumer Grade|989|AUG|0.19|0.12|75.00
Souvenir AUG | Sweeper (Factory New)|Consumer Grade|989|AUG|0.19|0.12|75.00
MAG-7 | Rust Coat (Factory New)|Consumer Grade|990|MAG-7|0.67|0.02|51.00
Souvenir MAG-7 | Rust Coat (Factory New)|Consumer Grade|990|MAG-7|0.67|0.02|51.00
PP-Bizon | Candy Apple (Factory New)|Industrial Grade|991|PP-Bizon|0.00|0.83|222.00
Souvenir PP-Bizon | Candy Apple (Factory New)|Industrial Grade|991|PP-Bizon|0.00|0.83|222.00
MAC-10 | Calf Skin (Factory New)|Industrial Grade|992|MAC-10|0.14|0.13|47.00
Souvenir MAC-10 | Calf Skin (Factory New)|Industrial Grade|992|MAC-10|0.14|0.13|47.00
R8 Revolver | Nitro (Factory New)|Industrial Grade|993|R8 Revolver|0.13|0.10|93.00
Souvenir R8 Revolver | Nitro (Factory New)|Industrial Grade|993|R8 Revolver|0.13|0.10|93.00
Glock-18 | High Beam (Factory New)|Industrial Grade|994|Glock-18|0.63|0.45|75.00
Souvenir Glock-18 | High Beam (Factory New)|Industrial Grade|994|Glock-18|0.63|0.45|75.00
SSG 08 | Hand Brake (Factory New)|Mil-Spec|995|SSG 08|0.17|0.07|15.00
Souvenir SSG 08 | Hand Brake (Factory New)|Mil-Spec|995|SSG 08|0.17|0.07|15.00
M4A4 | Converter (Factory New)|Mil-Spec|996|M4A4|0.77|0.09|57.00
Souvenir M4A4 | Converter (Factory New)|Mil-Spec|996|M4A4|0.77|0.09|57.00
USP-S | Check Engine (Factory New)|Mil-Spec|997|USP-S|0.02|0.80|128.00
Souvenir USP-S | Check Engine (Factory New)|Mil-Spec|997|USP-S|0.02|0.80|128.00
Sawed-Off | Brake Light (Factory New)|Mil-Spec|998|Sawed-Off|1.00|0.75|60.00
Souvenir Sawed-Off | Brake Light (Factory New)|Mil-Spec|998|Sawed-Off|1.00|0.75|60.00
P250 | Vino Primo (Factory New)|Restricted|999|P250|0.92|0.62|24.00
Souvenir P250 | Vino Primo (Factory New)|Restricted|999|P250|0.92|0.62|24.00
MP7 | Fade (Factory New)|Restricted|1000|MP7|0.11|0.10|91.00
Souvenir MP7 | Fade (Factory New)|Restricted|1000|MP7|0.11|0.10|91.00
AK-47 | Safety Net (Factory New)|Restricted|1001|AK-47|0.10|0.32|22.00
Souvenir AK-47 | Safety Net (Factory New)|Restricted|1001|AK-47|0.10|0.32|22.00
Dual Berettas | Twin Turbo (Factory New)|Classified|1002|Dual Berettas|0.38|0.85|27.00
Souvenir Dual Berettas | Twin Turbo (Factory New)|Classified|1002|Dual Berettas|0.38|0.85|27.00
SG 553 | Integrale (Factory New)|Classified|1003|SG 553|0.00|0.77|160.00
Souvenir SG 553 | Integrale (Factory New)|Classified|1003|SG 553|0.00|0.77|160.00
MP9 | Modest Threat (Factory New)|Mil-Spec|1005|MP9|0.22|0.07|43.00
Glock-18 | Oxide Blaze (Factory New)|Mil-Spec|1006|Glock-18|0.08|0.24|70.00
Nova | Wood Fired (Factory New)|Mil-Spec|1007|Nova|0.17|0.06|16.00
M4A4 | Magnesium (Factory New)|Mil-Spec|1008|M4A4|0.00|0.00|10.00
Sawed-Off | Black Sand (Factory New)|Mil-Spec|1009|Sawed-Off|0.17|0.07|14.00
SG 553 | Danger Close (Factory New)|Mil-Spec|1010|SG 553|0.11|0.09|32.00
G3SG1 | Scavenger (Factory New)|Restricted|1012|G3SG1|0.17|0.12|16.00
Galil AR | Signal (Factory New)|Restricted|1013|Galil AR|0.10|0.12|56.00
MAC-10 | Pipe Down (Factory New)|Restricted|1014|MAC-10|0.00|0.03|38.00
P250 | Nevermore (Factory New)|Restricted|1015|P250|0.01|0.84|61.00
USP-S | Flashback (Factory New)|Restricted|1016|USP-S|0.15|0.27|30.00
UMP-45 | Momentum (Factory New)|Classified|1017|UMP-45|0.45|0.09|255.00
Desert Eagle | Mecha Industries (Factory New)|Classified|1018|Desert Eagle|0.17|0.09|11.00
MP5-SD | Phosphor (Factory New)|Classified|1019|MP5-SD|0.65|0.48|21.00
AK-47 | Asiimov (Factory New)|Covert|1020|AK-47|0.10|0.12|42.00
AWP | Neo-Noir (Factory New)|Covert|1021|AWP|0.13|0.15|59.00
FAMAS | Crypsis (Factory New)|Mil-Spec|1022|FAMAS|0.09|0.33|83.00
AK-47 | Uncharted (Factory New)|Mil-Spec|1023|AK-47|0.17|0.08|12.00
MAC-10 | Whitefish (Factory New)|Mil-Spec|1024|MAC-10|0.10|0.10|104.00
Galil AR | Akoben (Factory New)|Mil-Spec|1025|Galil AR|0.99|0.30|46.00
P250 | Verdigris (Factory New)|Mil-Spec|1027|P250|0.17|0.09|45.00
P90 | Off World (Factory New)|Mil-Spec|1028|P90|0.51|0.35|60.00
AWP | Atheris (Factory New)|Restricted|1029|AWP|0.58|0.18|66.00
Tec-9 | Bamboozle (Factory New)|Restricted|1030|Tec-9|0.50|0.04|57.00
Desert Eagle | Light Rail (Factory New)|Restricted|1031|Desert Eagle|0.17|0.09|11.00
MP5-SD | Gauss (Factory New)|Restricted|1032|MP5-SD|0.17|0.08|13.00
UMP-45 | Moonrise (Factory New)|Restricted|1033|UMP-45|0.10|0.11|64.00
AUG | Momentum (Factory New)|Classified|1035|AUG|0.46|0.25|16.00
Five-SeveN | Angry Mob (Factory New)|Covert|1037|Five-SeveN|0.97|0.12|48.00
M4A4 | The Emperor (Factory New)|Covert|1038|M4A4|0.61|0.43|7.00
★ Navaja Knife | Damascus Steel (Factory New)|Covert|1039|Navaja Knife|0.50|0.03|255.00
★ Navaja Knife | Marble Fade (Factory New)|Covert|1041|Navaja Knife|0.00|0.00|40.00
★ Navaja Knife | Tiger Tooth (Factory New)|Covert|1043|Navaja Knife|0.11|0.72|255.00
★ Navaja Knife | Ultraviolet (Factory New)|Covert|1044|Navaja Knife|0.57|0.12|78.00
★ Stiletto Knife | Damascus Steel (Factory New)|Covert|1045|Stiletto Knife|0.00|0.00|40.00
★ Stiletto Knife | Marble Fade (Factory New)|Covert|1047|Stiletto Knife|0.00|0.03|40.00
★ Stiletto Knife | Tiger Tooth (Factory New)|Covert|1049|Stiletto Knife|0.09|0.75|244.00
★ Stiletto Knife | Ultraviolet (Factory New)|Covert|1050|Stiletto Knife|0.57|0.08|65.00
★ Talon Knife | Damascus Steel (Factory New)|Covert|1051|Talon Knife|0.50|0.03|255.00
★ Talon Knife | Marble Fade (Factory New)|Covert|1053|Talon Knife|0.13|0.14|177.00
★ Talon Knife | Tiger Tooth (Factory New)|Covert|1055|Talon Knife|0.09|0.91|97.00
★ Talon Knife | Ultraviolet (Factory New)|Covert|1056|Talon Knife|0.55|0.11|61.00
★ Ursus Knife | Damascus Steel (Factory New)|Covert|1057|Ursus Knife|0.50|0.03|255.00
★ Ursus Knife | Marble Fade (Factory New)|Covert|1059|Ursus Knife|0.42|0.06|33.00
★ Ursus Knife | Tiger Tooth (Factory New)|Covert|1061|Ursus Knife|0.12|0.69|255.00
★ Ursus Knife | Ultraviolet (Factory New)|Covert|1062|Ursus Knife|0.58|0.12|105.00
P250 | X-Ray (Factory New)|Restricted|1063|P250|0.41|0.40|243.00
Dual Berettas | Elite 1.6 (Factory New)|Mil-Spec|1064|Dual Berettas|0.67|0.10|10.00
Tec-9 | Flash Out (Factory New)|Mil-Spec|1065|Tec-9|0.00|0.00|4.00
MAC-10 | Classic Crate (Factory New)|Mil-Spec|1066|MAC-10|0.12|0.11|95.00
MAG-7 | Popdog (Factory New)|Mil-Spec|1067|MAG-7|0.17|0.07|15.00
SCAR-20 | Assault (Factory New)|Mil-Spec|1068|SCAR-20|0.08|0.11|18.00
FAMAS | Decommissioned (Factory New)|Mil-Spec|1069|FAMAS|0.10|0.12|43.00
Glock-18 | Sacrifice (Factory New)|Mil-Spec|1070|Glock-18|0.04|0.51|111.00
M249 | Aztec (Factory New)|Restricted|1071|M249|0.26|0.24|38.00
MP5-SD | Agent (Factory New)|Restricted|1072|MP5-SD|0.17|0.06|16.00
Five-SeveN | Buddy (Factory New)|Restricted|1073|Five-SeveN|0.00|0.00|15.00
P250 | Inferno (Factory New)|Restricted|1074|P250|0.17|0.07|44.00
UMP-45 | Plastique (Factory New)|Restricted|1075|UMP-45|0.50|0.12|8.00
MP9 | Hydra (Factory New)|Classified|1076|MP9|0.17|0.08|13.00
P90 | Nostalgia (Factory New)|Classified|1077|P90|0.11|0.10|31.00
AUG | Death by Puppy (Factory New)|Classified|1078|AUG|0.11|0.08|38.00
AWP | Wildfire (Factory New)|Covert|1079|AWP|0.03|0.30|20.00
FAMAS | Commemoration (Factory New)|Covert|1080|FAMAS|0.10|0.48|48.00
★ Classic Knife | Vanilla (Factory New)|Covert|1081|Classic Knife|0.00|0.00|20.00
★ Classic Knife | Fade (Factory New)|Covert|1082|Classic Knife|0.09|0.69|125.00
★ Classic Knife | Slaughter (Factory New)|Covert|1083|Classic Knife|0.00|0.57|144.00
★ Classic Knife | Blue Steel (Factory New)|Covert|1084|Classic Knife|0.58|0.32|50.00
★ Classic Knife | Stained (Factory New)|Covert|1085|Classic Knife|0.00|0.00|39.00
★ Classic Knife | Case Hardened (Factory New)|Covert|1086|Classic Knife|0.00|0.00|39.00
★ Classic Knife | Forest DDPAT (Factory New)|Covert|1087|Classic Knife|0.08|0.21|96.00
★ Classic Knife | Boreal Forest (Factory New)|Covert|1088|Classic Knife|0.14|0.16|128.00
★ Classic Knife | Crimson Web (Factory New)|Covert|1089|Classic Knife|0.01|0.61|170.00
★ Classic Knife | Scorched (Factory New)|Covert|1090|Classic Knife|0.56|0.03|93.00
★ Classic Knife | Safari Mesh (Factory New)|Covert|1091|Classic Knife|0.24|0.14|114.00
★ Classic Knife | Night Stripe (Factory New)|Covert|1092|Classic Knife|0.57|0.24|98.00
★ Classic Knife | Urban Masked (Factory New)|Covert|1093|Classic Knife|0.33|0.03|148.00
MP5-SD | Bamboo Garden (Factory New)|Consumer Grade|1094|MP5-SD|0.15|0.24|42.00
MAC-10 | Surfwood (Factory New)|Consumer Grade|1095|MAC-10|0.17|0.02|255.00
PP-Bizon | Seabird (Factory New)|Consumer Grade|1096|PP-Bizon|0.49|0.22|91.00
Sawed-Off | Jungle Thicket (Factory New)|Consumer Grade|1097|Sawed-Off|0.30|0.61|57.00
M249 | Jungle (Factory New)|Consumer Grade|1098|M249|0.12|0.32|31.00
P90 | Sunset Lily (Factory New)|Industrial Grade|1099|P90|0.98|0.12|78.00
M4A4 | Dark Blossom (Factory New)|Industrial Grade|1100|M4A4|0.19|0.12|65.00
XM1014 | Banana Leaf (Factory New)|Industrial Grade|1101|XM1014|0.46|0.34|41.00
Tec-9 | Rust Leaf (Factory New)|Industrial Grade|1102|Tec-9|0.08|0.35|23.00
UMP-45 | Day Lily (Factory New)|Mil-Spec|1103|UMP-45|0.10|0.11|64.00
Five-SeveN | Crimson Blossom (Factory New)|Mil-Spec|1104|Five-SeveN|0.95|0.78|95.00
MP7 | Teal Blossom (Factory New)|Mil-Spec|1105|MP7|0.46|0.28|50.00
FAMAS | Sundown (Factory New)|Mil-Spec|1106|FAMAS|0.73|0.31|58.00
SSG 08 | Sea Calico (Factory New)|Restricted|1107|SSG 08|0.46|0.69|39.00
Glock-18 | Synth Leaf (Factory New)|Restricted|1108|Glock-18|0.91|0.57|63.00
AUG | Midnight Lily (Factory New)|Restricted|1109|AUG|0.11|0.08|38.00
MP9 | Wild Lily (Factory New)|Classified|1110|MP9|0.60|0.38|13.00
AK-47 | Wild Lotus (Factory New)|Covert|1111|AK-47|0.04|0.25|16.00
AUG | Navy Murano (Factory New)|Consumer Grade|1112|AUG|0.64|0.54|68.00
SCAR-20 | Stone Mosaico (Factory New)|Consumer Grade|1113|SCAR-20|0.56|0.14|77.00
R8 Revolver | Canal Spray (Factory New)|Consumer Grade|1114|R8 Revolver|0.53|0.40|15.00
Negev | Boroque Sand (Factory New)|Consumer Grade|1115|Negev|0.85|0.18|76.00
CZ75-Auto | Indigo (Factory New)|Consumer Grade|1116|CZ75-Auto|0.11|0.11|84.00
AK-47 | Baroque Purple (Factory New)|Industrial Grade|1117|AK-47|0.08|0.11|53.00
SG 553 | Candy Apple (Factory New)|Industrial Grade|1118|SG 553|0.09|0.11|80.00
P250 | Dark Filigree (Factory New)|Industrial Grade|1119|P250|0.61|0.10|30.00
Tec-9 | Orange Murano (Factory New)|Industrial Grade|1120|Tec-9|0.08|0.64|159.00
P90 | Baroque Red (Factory New)|Mil-Spec|1121|P90|0.11|0.12|52.00
G3SG1 | Violet Murano (Factory New)|Mil-Spec|1122|G3SG1|0.64|0.46|81.00
Dual Berettas | Emerald (Factory New)|Mil-Spec|1123|Dual Berettas|0.00|0.00|30.00
SSG 08 | Orange Filigree (Factory New)|Mil-Spec|1124|SSG 08|0.02|0.35|65.00
MP9 | Stained Glass (Factory New)|Restricted|1125|MP9|0.17|0.09|47.00
MAC-10 | Red Filigree (Factory New)|Restricted|1126|MAC-10|0.09|0.11|84.00
Nova | Baroque Orange (Factory New)|Restricted|1127|Nova|0.42|0.12|50.00
MAG-7 | Cinquedea (Factory New)|Classified|1128|MAG-7|0.17|0.04|25.00
AWP | The Prince (Factory New)|Covert|1129|AWP|0.08|0.12|17.00
SG 553 | Barricade (Factory New)|Consumer Grade|1130|SG 553|0.58|0.23|47.00
Galil AR | Tornado (Factory New)|Consumer Grade|1131|Galil AR|0.60|0.21|133.00
MP7 | Scorched (Factory New)|Consumer Grade|1132|MP7|0.00|0.08|24.00
SSG 08 | Red Stone (Factory New)|Consumer Grade|1133|SSG 08|0.06|0.30|27.00
FAMAS | Night Borre (Factory New)|Consumer Grade|1134|FAMAS|0.10|0.11|47.00
M4A1-S | Moss Quartz (Factory New)|Industrial Grade|1135|M4A1-S|0.23|0.28|50.00
USP-S | Pathfinder (Factory New)|Industrial Grade|1136|USP-S|0.08|0.12|51.00
MAG-7 | Chainmail (Factory New)|Industrial Grade|1137|MAG-7|0.13|0.60|60.00
Dual Berettas | Pyre (Factory New)|Industrial Grade|1138|Dual Berettas|0.02|0.82|45.00
SCAR-20 | Brass (Factory New)|Mil-Spec|1139|SCAR-20|0.19|0.12|65.00
CZ75-Auto | Emerald Quartz (Factory New)|Mil-Spec|1140|CZ75-Auto|0.17|0.09|45.00
XM1014 | Frost Borre (Factory New)|Mil-Spec|1141|XM1014|0.08|0.10|62.00
MAC-10 | Copper Borre (Factory New)|Mil-Spec|1142|MAC-10|0.09|0.11|84.00
AUG | Flame Jörmungandr (Factory New)|Restricted|1143|AUG|0.11|0.08|38.00
Desert Eagle | Emerald Jörmungandr (Factory New)|Restricted|1144|Desert Eagle|0.27|0.67|54.00
P90 | Astral Jörmungandr (Factory New)|Restricted|1145|P90|0.06|0.34|119.00
Negev | Mjölnir (Factory New)|Classified|1146|Negev|0.00|0.82|255.00
AWP | Gungnir (Factory New)|Covert|1147|AWP|0.17|0.09|255.00
MP5-SD | Acid Wash (Factory New)|Mil-Spec|1148|MP5-SD|0.08|0.11|18.00
Nova | Plume (Factory New)|Mil-Spec|1149|Nova|0.08|0.24|17.00
G3SG1 | Black Sand (Factory New)|Mil-Spec|1150|G3SG1|0.17|0.07|14.00
R8 Revolver | Memento (Factory New)|Mil-Spec|1151|R8 Revolver|0.00|0.00|3.00
Dual Berettas | Balance (Factory New)|Mil-Spec|1152|Dual Berettas|0.11|0.12|26.00
SCAR-20 | Torn (Factory New)|Mil-Spec|1153|SCAR-20|0.08|0.09|69.00
M249 | Warbird (Factory New)|Mil-Spec|1154|M249|0.08|0.50|8.00
PP-Bizon | Embargo (Factory New)|Restricted|1155|PP-Bizon|0.44|0.43|7.00
AK-47 | Rat Rod (Factory New)|Restricted|1156|AK-47|0.17|0.06|34.00
AUG | Arctic Wolf (Factory New)|Restricted|1157|AUG|0.17|0.02|255.00
MP7 | Neon Ply (Factory New)|Restricted|1158|MP7|0.24|0.19|36.00
P2000 | Obsidian (Factory New)|Restricted|1159|P2000|0.83|0.04|96.00
Tec-9 | Decimator (Factory New)|Classified|1160|Tec-9|0.00|0.00|4.00
SG 553 | Colony IV (Factory New)|Classified|1161|SG 553|0.00|0.00|9.00
AWP | Containment Breach (Factory New)|Covert|1163|AWP|0.17|0.07|15.00
MAC-10 | Stalker (Factory New)|Covert|1164|MAC-10|0.17|0.65|255.00
★ Nomad Knife | Vanilla (Factory New)|Covert|1165|Nomad Knife|0.50|0.04|26.00
★ Nomad Knife | Fade (Factory New)|Covert|1166|Nomad Knife|0.56|0.06|51.00
★ Nomad Knife | Slaughter (Factory New)|Covert|1167|Nomad Knife|0.56|0.06|51.00
★ Nomad Knife | Blue Steel (Factory New)|Covert|1168|Nomad Knife|0.56|0.06|51.00
★ Nomad Knife | Stained (Factory New)|Covert|1169|Nomad Knife|0.56|0.06|51.00
★ Nomad Knife | Case Hardened (Factory New)|Covert|1170|Nomad Knife|0.56|0.06|51.00
★ Nomad Knife | Forest DDPAT (Factory New)|Covert|1171|Nomad Knife|0.30|0.27|142.00
★ Nomad Knife | Boreal Forest (Factory New)|Covert|1172|Nomad Knife|0.16|0.11|148.00
★ Nomad Knife | Crimson Web (Factory New)|Covert|1173|Nomad Knife|0.50|0.04|96.00
★ Nomad Knife | Scorched (Factory New)|Covert|1174|Nomad Knife|0.67|0.05|131.00
★ Nomad Knife | Safari Mesh (Factory New)|Covert|1175|Nomad Knife|0.28|0.11|136.00
★ Nomad Knife | Night Stripe (Factory New)|Covert|1176|Nomad Knife|0.57|0.25|120.00
★ Nomad Knife | Urban Masked (Factory New)|Covert|1177|Nomad Knife|0.50|0.00|255.00
★ Skeleton Knife | Vanilla (Factory New)|Covert|1178|Skeleton Knife|0.42|0.05|41.00
★ Skeleton Knife | Fade (Factory New)|Covert|1179|Skeleton Knife|0.42|0.08|53.00
★ Skeleton Knife | Slaughter (Factory New)|Covert|1180|Skeleton Knife|0.42|0.08|53.00
★ Skeleton Knife | Blue Steel (Factory New)|Covert|1181|Skeleton Knife|0.42|0.08|53.00
★ Skeleton Knife | Stained (Factory New)|Covert|1182|Skeleton Knife|0.42|0.08|53.00
★ Skeleton Knife | Case Hardened (Factory New)|Covert|1183|Skeleton Knife|0.42|0.08|53.00
★ Skeleton Knife | Forest DDPAT (Factory New)|Covert|1184|Skeleton Knife|0.28|0.29|107.00
★ Skeleton Knife | Boreal Forest (Factory New)|Covert|1185|Skeleton Knife|0.15|0.14|115.00
★ Skeleton Knife | Scorched (Factory New)|Covert|1187|Skeleton Knife|0.67|0.04|76.00
★ Skeleton Knife | Safari Mesh (Factory New)|Covert|1188|Skeleton Knife|0.23|0.15|116.00
★ Skeleton Knife | Night Stripe (Factory New)|Covert|1189|Skeleton Knife|0.57|0.24|99.00
★ Skeleton Knife | Urban Masked (Factory New)|Covert|1190|Skeleton Knife|0.38|0.04|187.00
★ Survival Knife | Vanilla (Factory New)|Covert|1191|Survival Knife|0.50|0.03|32.00
★ Survival Knife | Fade (Factory New)|Covert|1192|Survival Knife|0.25|0.04|53.00
★ Survival Knife | Slaughter (Factory New)|Covert|1193|Survival Knife|0.25|0.04|53.00
★ Survival Knife | Blue Steel (Factory New)|Covert|1194|Survival Knife|0.25|0.04|53.00
★ Survival Knife | Stained (Factory New)|Covert|1195|Survival Knife|0.25|0.04|53.00
★ Survival Knife | Case Hardened (Factory New)|Covert|1196|Survival Knife|0.25|0.04|53.00
★ Survival Knife | Forest DDPAT (Factory New)|Covert|1197|Survival Knife|0.27|0.30|124.00
★ Survival Knife | Boreal Forest (Factory New)|Covert|1198|Survival Knife|0.13|0.16|134.00
★ Survival Knife | Crimson Web (Factory New)|Covert|1199|Survival Knife|0.25|0.02|81.00
★ Survival Knife | Scorched (Factory New)|Covert|1200|Survival Knife|0.00|0.02|45.00
★ Survival Knife | Safari Mesh (Factory New)|Covert|1201|Survival Knife|0.23|0.14|118.00
★ Survival Knife | Night Stripe (Factory New)|Covert|1202|Survival Knife|0.57|0.24|98.00
★ Survival Knife | Urban Masked (Factory New)|Covert|1203|Survival Knife|0.31|0.04|153.00
★ Paracord Knife | Vanilla (Factory New)|Covert|1204|Paracord Knife|0.60|0.14|73.00
★ Paracord Knife | Fade (Factory New)|Covert|1205|Paracord Knife|0.08|0.71|112.00
★ Paracord Knife | Slaughter (Factory New)|Covert|1206|Paracord Knife|1.00|0.60|171.00
★ Paracord Knife | Blue Steel (Factory New)|Covert|1207|Paracord Knife|0.59|0.30|44.00
★ Paracord Knife | Stained (Factory New)|Covert|1208|Paracord Knife|0.50|0.05|88.00
★ Paracord Knife | Case Hardened (Factory New)|Covert|1209|Paracord Knife|0.17|0.05|41.00
★ Paracord Knife | Forest DDPAT (Factory New)|Covert|1210|Paracord Knife|0.09|0.24|96.00
★ Paracord Knife | Boreal Forest (Factory New)|Covert|1211|Paracord Knife|0.13|0.17|127.00
★ Paracord Knife | Crimson Web (Factory New)|Covert|1212|Paracord Knife|0.01|0.70|174.00
★ Paracord Knife | Scorched (Factory New)|Covert|1213|Paracord Knife|0.00|0.02|52.00
★ Paracord Knife | Safari Mesh (Factory New)|Covert|1214|Paracord Knife|0.17|0.20|118.00
★ Paracord Knife | Night Stripe (Factory New)|Covert|1215|Paracord Knife|0.57|0.24|96.00
★ Paracord Knife | Urban Masked (Factory New)|Covert|1216|Paracord Knife|0.17|0.01|200.00
AUG | Tom Cat (Factory New)|Mil-Spec|1217|AUG|0.17|0.08|13.00
AWP | Capillary (Factory New)|Mil-Spec|1218|AWP|0.42|0.11|53.00
CZ75-Auto | Distressed (Factory New)|Mil-Spec|1219|CZ75-Auto|0.98|0.12|75.00
Desert Eagle | Blue Ply (Factory New)|Mil-Spec|1220|Desert Eagle|0.00|0.00|9.00
MP5-SD | Desert Strike (Factory New)|Mil-Spec|1221|MP5-SD|0.17|0.07|15.00
Negev | Prototype (Factory New)|Mil-Spec|1222|Negev|0.17|0.09|22.00
R8 Revolver | Bone Forged (Factory New)|Mil-Spec|1223|R8 Revolver|0.17|0.07|15.00
P2000 | Acid Etched (Factory New)|Restricted|1224|P2000|0.62|0.60|25.00
Sawed-Off | Apocalypto (Factory New)|Restricted|1225|Sawed-Off|0.77|0.46|24.00
SCAR-20 | Enforcer (Factory New)|Restricted|1226|SCAR-20|0.67|0.15|13.00
SG 553 | Darkwing (Factory New)|Restricted|1227|SG 553|0.67|0.11|9.00
SSG 08 | Fever Dream (Factory New)|Restricted|1228|SSG 08|0.17|0.07|14.00
AK-47 | Phantom Disruptor (Factory New)|Classified|1229|AK-47|0.17|0.10|10.00
MAC-10 | Disco Tech (Factory New)|Classified|1230|MAC-10|0.13|0.10|94.00
MAG-7 | Justice (Factory New)|Classified|1231|MAG-7|0.17|0.10|10.00
M4A1-S | Player Two (Factory New)|Covert|1232|M4A1-S|0.09|0.10|90.00
Glock-18 | Bullet Queen (Factory New)|Covert|1233|Glock-18|0.10|0.12|42.00
Negev | Ultralight (Factory New)|Mil-Spec|1234|Negev|0.08|0.10|21.00
P2000 | Gnarled (Factory New)|Mil-Spec|1235|P2000|0.50|0.22|23.00
SG 553 | Ol' Rusty (Factory New)|Mil-Spec|1236|SG 553|0.03|0.48|21.00
SSG 08 | Mainframe 001 (Factory New)|Mil-Spec|1237|SSG 08|0.17|0.07|14.00
P250 | Cassette (Factory New)|Mil-Spec|1238|P250|0.15|0.10|136.00
P90 | Freight (Factory New)|Mil-Spec|1239|P90|0.17|0.08|25.00
PP-Bizon | Runic (Factory New)|Mil-Spec|1240|PP-Bizon|0.08|0.12|17.00
MAG-7 | Monster Call (Factory New)|Restricted|1241|MAG-7|0.64|0.49|144.00
Tec-9 | Brother (Factory New)|Restricted|1242|Tec-9|0.19|0.12|65.00
MAC-10 | Allure (Factory New)|Restricted|1243|MAC-10|0.08|0.11|53.00
Galil AR | Connexion (Factory New)|Restricted|1244|Galil AR|0.11|0.13|23.00
MP5-SD | Kitbash (Factory New)|Restricted|1245|MP5-SD|0.17|0.06|16.00
M4A4 | Tooth Fairy (Factory New)|Classified|1246|M4A4|0.00|0.20|5.00
Glock-18 | Vogue (Factory New)|Classified|1247|Glock-18|0.98|0.87|214.00
XM1014 | Entombed (Factory New)|Classified|1248|XM1014|0.09|0.44|25.00
Desert Eagle | Printstream (Factory New)|Covert|1249|Desert Eagle|0.13|0.08|59.00
AK-47 | Legion of Anubis (Factory New)|Covert|1250|AK-47|0.17|0.07|15.00
CZ75-Auto | Vendetta (Factory New)|Mil-Spec|1251|CZ75-Auto|0.11|0.29|95.00
P90 | Cocoa Rampage (Factory New)|Mil-Spec|1252|P90|0.33|0.30|66.00
G3SG1 | Digital Mesh (Factory New)|Mil-Spec|1253|G3SG1|0.17|0.07|15.00
Galil AR | Vandal (Factory New)|Mil-Spec|1254|Galil AR|0.17|0.09|34.00
P250 | Contaminant (Factory New)|Mil-Spec|1255|P250|0.10|0.11|44.00
M249 | Deep Relief (Factory New)|Mil-Spec|1256|M249|0.17|0.05|255.00
MP5-SD | Condition Zero (Factory New)|Mil-Spec|1257|MP5-SD|0.17|0.06|16.00
AWP | Exoskeleton (Factory New)|Restricted|1258|AWP|0.17|0.08|12.00
Dual Berettas | Dezastre (Factory New)|Restricted|1259|Dual Berettas|0.67|0.10|10.00
Nova | Clear Polymer (Factory New)|Restricted|1260|Nova|0.17|0.07|15.00
SSG 08 | Parallax (Factory New)|Restricted|1261|SSG 08|0.17|0.07|15.00
UMP-45 | Gold Bismuth (Factory New)|Restricted|1262|UMP-45|0.19|0.12|66.00
Five-SeveN | Fairy Tale (Factory New)|Classified|1263|Five-SeveN|0.90|0.53|30.00
M4A4 | Cyber Security (Factory New)|Classified|1264|M4A4|0.00|0.00|3.00
USP-S | Monster Mashup (Factory New)|Classified|1265|USP-S|0.17|0.71|255.00
M4A1-S | Printstream (Factory New)|Covert|1266|M4A1-S|0.17|0.01|255.00
Glock-18 | Neo-Noir (Factory New)|Covert|1267|Glock-18|0.10|0.12|42.00
XM1014 | Charter (Factory New)|Consumer Grade|1268|XM1014|0.08|0.10|62.00
AUG | Surveillance (Factory New)|Consumer Grade|1269|AUG|0.11|0.08|38.00
MP9 | Army Sheen (Factory New)|Consumer Grade|1270|MP9|0.10|0.33|48.00
P250 | Forest Night (Factory New)|Consumer Grade|1271|P250|0.54|0.21|131.00
CZ75-Auto | Jungle Dashed (Factory New)|Consumer Grade|1272|CZ75-Auto|0.12|0.36|64.00
Desert Eagle | The Bronze (Factory New)|Industrial Grade|1273|Desert Eagle|0.10|0.27|44.00
Dual Berettas | Switch Board (Factory New)|Industrial Grade|1274|Dual Berettas|0.15|0.45|141.00
MP5-SD | Nitro (Factory New)|Industrial Grade|1275|MP5-SD|0.17|0.10|20.00
MAG-7 | Carbon Fiber (Factory New)|Industrial Grade|1276|MAG-7|0.08|0.08|52.00
M4A4 | Global Offensive (Factory New)|Mil-Spec|1277|M4A4|0.36|0.07|83.00
SSG 08 | Threat Detected (Factory New)|Mil-Spec|1278|SSG 08|0.17|0.09|44.00
P2000 | Dispatch (Factory New)|Mil-Spec|1279|P2000|0.03|0.81|97.00
SCAR-20 | Magna Carta (Factory New)|Mil-Spec|1280|SCAR-20|0.88|0.38|66.00
FAMAS | Prime Conspiracy (Factory New)|Restricted|1281|FAMAS|0.12|0.32|22.00
Five-SeveN | Berries And Cherries (Factory New)|Restricted|1282|Five-SeveN|0.17|0.06|17.00
UMP-45 | Crime Scene (Factory New)|Restricted|1283|UMP-45|0.10|0.11|63.00
USP-S | Target Acquired (Factory New)|Classified|1284|USP-S|0.00|0.33|51.00
M4A1-S | Blue Phosphor (Factory New)|Classified|1285|M4A1-S|0.60|0.87|31.00
AWP | Fade (Factory New)|Covert|1286|AWP|0.98|0.69|71.00
Dual Berettas | Heist (Factory New)|Consumer Grade|1287|Dual Berettas|0.11|0.12|26.00
Tec-9 | Phoenix Chalk (Factory New)|Consumer Grade|1288|Tec-9|0.00|0.19|64.00
Sawed-Off | Clay Ambush (Factory New)|Consumer Grade|1289|Sawed-Off|0.04|0.26|53.00
M249 | Predator (Factory New)|Consumer Grade|1291|M249|0.07|0.50|18.00
MP7 | Vault Heist (Factory New)|Industrial Grade|1292|MP7|0.98|0.14|59.00
UMP-45 | Houndstooth (Factory New)|Industrial Grade|1293|UMP-45|0.10|0.11|64.00
R8 Revolver | Phoenix Marker (Factory New)|Industrial Grade|1294|R8 Revolver|0.63|0.23|92.00
Nova | Rust Coat (Factory New)|Industrial Grade|1295|Nova|0.42|0.12|50.00
Desert Eagle | Night Heist (Factory New)|Mil-Spec|1296|Desert Eagle|0.64|0.39|18.00
Negev | Phoenix Stencil (Factory New)|Mil-Spec|1297|Negev|0.67|0.19|75.00
P90 | Tiger Pit (Factory New)|Mil-Spec|1298|P90|0.21|0.14|98.00
P250 | Bengal Tiger (Factory New)|Mil-Spec|1299|P250|0.12|0.09|255.00
Galil AR | Phoenix Blacklight (Factory New)|Restricted|1300|Galil AR|0.66|0.45|249.00
SG 553 | Hypnotic (Factory New)|Restricted|1301|SG 553|0.11|0.10|91.00
Glock-18 | Franklin (Factory New)|Restricted|1302|Glock-18|0.14|0.14|214.00
AWP | Silk Tiger (Factory New)|Classified|1303|AWP|0.17|0.09|33.00
MAC-10 | Hot Snakes (Factory New)|Classified|1304|MAC-10|0.05|0.27|26.00
AK-47 | X-Ray (Factory New)|Covert|1305|AK-47|0.07|0.43|255.00
P90 | Ancient Earth (Factory New)|Consumer Grade|1306|P90|0.06|0.52|86.00
Souvenir P90 | Ancient Earth (Factory New)|Consumer Grade|1306|P90|0.06|0.52|86.00
SG 553 | Lush Ruins (Factory New)|Consumer Grade|1307|SG 553|0.11|0.10|91.00
Souvenir SG 553 | Lush Ruins (Factory New)|Consumer Grade|1307|SG 553|0.11|0.10|91.00
Nova | Army Sheen (Factory New)|Consumer Grade|1308|Nova|0.42|0.12|50.00
Souvenir Nova | Army Sheen (Factory New)|Consumer Grade|1308|Nova|0.42|0.12|50.00
SSG 08 | Jungle Dashed (Factory New)|Consumer Grade|1309|SSG 08|0.11|0.35|62.00
Souvenir SSG 08 | Jungle Dashed (Factory New)|Consumer Grade|1309|SSG 08|0.11|0.35|62.00
R8 Revolver | Night (Factory New)|Consumer Grade|1310|R8 Revolver|0.50|0.03|59.00
Souvenir R8 Revolver | Night (Factory New)|Consumer Grade|1310|R8 Revolver|0.50|0.03|59.00
P2000 | Panther Camo (Factory New)|Industrial Grade|1311|P2000|0.10|0.19|26.00
Souvenir P2000 | Panther Camo (Factory New)|Industrial Grade|1311|P2000|0.10|0.19|26.00
MP7 | Tall Grass (Factory New)|Industrial Grade|1312|MP7|0.19|0.37|115.00
Souvenir MP7 | Tall Grass (Factory New)|Industrial Grade|1312|MP7|0.19|0.37|115.00
G3SG1 | Ancient Ritual (Factory New)|Industrial Grade|1313|G3SG1|0.05|0.55|97.00
Souvenir G3SG1 | Ancient Ritual (Factory New)|Industrial Grade|1313|G3SG1|0.05|0.55|97.00
CZ75-Auto | Silver (Factory New)|Industrial Grade|1314|CZ75-Auto|0.14|0.08|85.00
Souvenir CZ75-Auto | Silver (Factory New)|Industrial Grade|1314|CZ75-Auto|0.14|0.08|85.00
Tec-9 | Blast From the Past (Factory New)|Mil-Spec|1315|Tec-9|0.16|0.26|90.00
Souvenir Tec-9 | Blast From the Past (Factory New)|Mil-Spec|1315|Tec-9|0.16|0.26|90.00
AUG | Carved Jade (Factory New)|Mil-Spec|1316|AUG|0.28|0.65|52.00
Souvenir AUG | Carved Jade (Factory New)|Mil-Spec|1316|AUG|0.28|0.65|52.00
Galil AR | Dusk Ruins (Factory New)|Mil-Spec|1317|Galil AR|0.18|0.43|56.00
Souvenir Galil AR | Dusk Ruins (Factory New)|Mil-Spec|1317|Galil AR|0.18|0.43|56.00
XM1014 | Ancient Lore (Factory New)|Restricted|1319|XM1014|0.08|0.10|62.00
Souvenir XM1014 | Ancient Lore (Factory New)|Restricted|1319|XM1014|0.08|0.10|62.00
MAC-10 | Gold Brick (Factory New)|Restricted|1320|MAC-10|0.10|0.11|62.00
Souvenir MAC-10 | Gold Brick (Factory New)|Restricted|1320|MAC-10|0.10|0.11|62.00
USP-S | Ancient Visions (Factory New)|Restricted|1321|USP-S|0.22|0.15|39.00
Souvenir USP-S | Ancient Visions (Factory New)|Restricted|1321|USP-S|0.22|0.15|39.00
P90 | Run and Hide (Factory New)|Classified|1322|P90|0.17|0.06|16.00
Souvenir P90 | Run and Hide (Factory New)|Classified|1322|P90|0.17|0.06|16.00
AK-47 | Panthera onca (Factory New)|Classified|1323|AK-47|0.17|0.08|12.00
Souvenir AK-47 | Panthera onca (Factory New)|Classified|1323|AK-47|0.17|0.08|12.00
M4A1-S | Welcome to the Jungle (Factory New)|Covert|1324|M4A1-S|0.59|0.45|143.00
Souvenir M4A1-S | Welcome to the Jungle (Factory New)|Covert|1324|M4A1-S|0.59|0.45|143.00
Glock-18 | Clear Polymer (Factory New)|Mil-Spec|1325|Glock-18|0.08|0.53|62.00
M249 | O.S.I.P.R. (Factory New)|Mil-Spec|1326|M249|0.58|0.35|17.00
SG 553 | Heavy Metal (Factory New)|Mil-Spec|1327|SG 553|0.17|0.06|16.00
R8 Revolver | Junk Yard (Factory New)|Mil-Spec|1328|R8 Revolver|0.47|0.27|22.00
UMP-45 | Oscillator (Factory New)|Mil-Spec|1329|UMP-45|0.33|0.08|12.00
Nova | Windblown (Factory New)|Mil-Spec|1330|Nova|0.58|0.38|104.00
CZ75-Auto | Circaetus (Factory New)|Mil-Spec|1331|CZ75-Auto|0.50|1.00|1.00
AK-47 | Slate (Factory New)|Restricted|1332|AK-47|0.08|0.06|31.00
P250 | Cyber Shell (Factory New)|Restricted|1333|P250|0.08|0.21|28.00
Negev | dev_texture (Factory New)|Restricted|1334|Negev|0.08|0.10|20.00
MAC-10 | Button Masher (Factory New)|Restricted|1335|MAC-10|0.13|0.16|61.00
Desert Eagle | Trigger Discipline (Factory New)|Restricted|1336|Desert Eagle|0.00|0.00|7.00
MP9 | Food Chain (Factory New)|Classified|1337|MP9|0.00|0.08|12.00
XM1014 | XOXO (Factory New)|Classified|1338|XM1014|0.08|0.10|62.00
Galil AR | Chromatic Aberration (Factory New)|Classified|1339|Galil AR|0.17|0.08|13.00
USP-S | The Traitor (Factory New)|Covert|1340|USP-S|0.03|0.24|25.00
M4A4 | In Living Color (Factory New)|Covert|1341|M4A4|0.00|0.00|3.00
R8 Revolver | Desert Brush (Factory New)|Consumer Grade|1342|R8 Revolver|0.11|0.35|189.00
Souvenir R8 Revolver | Desert Brush (Factory New)|Consumer Grade|1342|R8 Revolver|0.11|0.35|189.00
P90 | Desert DDPAT (Factory New)|Consumer Grade|1343|P90|0.10|0.30|184.00
Souvenir P90 | Desert DDPAT (Factory New)|Consumer Grade|1343|P90|0.10|0.30|184.00
SG 553 | Bleached (Factory New)|Consumer Grade|1344|SG 553|0.00|0.17|6.00
Souvenir SG 553 | Bleached (Factory New)|Consumer Grade|1344|SG 553|0.00|0.17|6.00
MP7 | Prey (Factory New)|Consumer Grade|1345|MP7|0.06|0.21|14.00
Souvenir MP7 | Prey (Factory New)|Consumer Grade|1345|MP7|0.06|0.21|14.00
Sawed-Off | Parched (Factory New)|Consumer Grade|1346|Sawed-Off|0.00|0.00|15.00
Souvenir Sawed-Off | Parched (Factory New)|Consumer Grade|1346|Sawed-Off|0.00|0.00|15.00
AUG | Spalted Wood (Factory New)|Industrial Grade|1347|AUG|0.08|0.58|138.00
Souvenir AUG | Spalted Wood (Factory New)|Industrial Grade|1347|AUG|0.08|0.58|138.00
MP9 | Old Roots (Factory New)|Industrial Grade|1348|MP9|0.24|0.42|55.00
Souvenir MP9 | Old Roots (Factory New)|Industrial Grade|1348|MP9|0.24|0.42|55.00
Five-SeveN | Withered Vine (Factory New)|Industrial Grade|1349|Five-SeveN|0.94|0.16|19.00
Souvenir Five-SeveN | Withered Vine (Factory New)|Industrial Grade|1349|Five-SeveN|0.94|0.16|19.00
M249 | Midnight Palm (Factory New)|Industrial Grade|1350|M249|0.20|0.13|84.00
Souvenir M249 | Midnight Palm (Factory New)|Industrial Grade|1350|M249|0.20|0.13|84.00
P250 | Black & Tan (Factory New)|Mil-Spec|1351|P250|0.08|0.28|156.00
Souvenir P250 | Black & Tan (Factory New)|Mil-Spec|1351|P250|0.08|0.28|156.00
Nova | Quick Sand (Factory New)|Mil-Spec|1352|Nova|0.53|0.36|14.00
Souvenir Nova | Quick Sand (Factory New)|Mil-Spec|1352|Nova|0.53|0.36|14.00
G3SG1 | New Roots (Factory New)|Mil-Spec|1353|G3SG1|0.57|0.10|50.00
Souvenir G3SG1 | New Roots (Factory New)|Mil-Spec|1353|G3SG1|0.57|0.10|50.00
Galil AR | Amber Fade (Factory New)|Mil-Spec|1354|Galil AR|0.18|0.12|85.00
Souvenir Galil AR | Amber Fade (Factory New)|Mil-Spec|1354|Galil AR|0.18|0.12|85.00
USP-S | Orange Anolis (Factory New)|Restricted|1355|USP-S|0.90|0.26|70.00
Souvenir USP-S | Orange Anolis (Factory New)|Restricted|1355|USP-S|0.90|0.26|70.00
M4A4 | Red DDPAT (Factory New)|Restricted|1356|M4A4|0.62|0.18|60.00
Souvenir M4A4 | Red DDPAT (Factory New)|Restricted|1356|M4A4|0.62|0.18|60.00
MAC-10 | Case Hardened (Factory New)|Restricted|1357|MAC-10|0.09|0.11|84.00
Souvenir MAC-10 | Case Hardened (Factory New)|Restricted|1357|MAC-10|0.09|0.11|84.00
UMP-45 | Fade (Factory New)|Classified|1358|UMP-45|0.10|0.11|74.00
Souvenir UMP-45 | Fade (Factory New)|Classified|1358|UMP-45|0.10|0.11|74.00
SSG 08 | Death Strike (Factory New)|Classified|1359|SSG 08|0.17|0.07|15.00
Souvenir SSG 08 | Death Strike (Factory New)|Classified|1359|SSG 08|0.17|0.07|15.00
AK-47 | Gold Arabesque (Factory New)|Covert|1360|AK-47|0.11|0.64|55.00
Souvenir AK-47 | Gold Arabesque (Factory New)|Covert|1360|AK-47|0.11|0.64|55.00
P250 | Drought (Factory New)|Consumer Grade|1361|P250|0.62|0.26|76.00
Souvenir P250 | Drought (Factory New)|Consumer Grade|1361|P250|0.62|0.26|76.00
PP-Bizon | Anolis (Factory New)|Consumer Grade|1362|PP-Bizon|0.24|0.21|52.00
Souvenir PP-Bizon | Anolis (Factory New)|Consumer Grade|1362|PP-Bizon|0.24|0.21|52.00
MAG-7 | Navy Sheen (Factory New)|Consumer Grade|1363|MAG-7|0.60|0.39|74.00
Souvenir MAG-7 | Navy Sheen (Factory New)|Consumer Grade|1363|MAG-7|0.60|0.39|74.00
MAC-10 | Sienna Damask (Factory New)|Consumer Grade|1364|MAC-10|0.13|0.36|147.00
Souvenir MAC-10 | Sienna Damask (Factory New)|Consumer Grade|1364|MAC-10|0.13|0.36|147.00
SSG 08 | Prey (Factory New)|Consumer Grade|1365|SSG 08|0.08|0.12|17.00
Souvenir SSG 08 | Prey (Factory New)|Consumer Grade|1365|SSG 08|0.08|0.12|17.00
Dual Berettas | Drift Wood (Factory New)|Industrial Grade|1366|Dual Berettas|0.00|0.22|9.00
Souvenir Dual Berettas | Drift Wood (Factory New)|Industrial Grade|1366|Dual Berettas|0.00|0.22|9.00
FAMAS | CaliCamo (Factory New)|Industrial Grade|1367|FAMAS|0.10|0.39|71.00
Souvenir FAMAS | CaliCamo (Factory New)|Industrial Grade|1367|FAMAS|0.10|0.39|71.00
CZ75-Auto | Midnight Palm (Factory New)|Industrial Grade|1368|CZ75-Auto|0.21|0.14|57.00
Souvenir CZ75-Auto | Midnight Palm (Factory New)|Industrial Grade|1368|CZ75-Auto|0.21|0.14|57.00
P90 | Verdant Growth (Factory New)|Industrial Grade|1369|P90|0.10|0.20|41.00
Souvenir P90 | Verdant Growth (Factory New)|Industrial Grade|1369|P90|0.10|0.20|41.00
USP-S | Purple DDPAT (Factory New)|Mil-Spec|1370|USP-S|0.77|0.29|35.00
Souvenir USP-S | Purple DDPAT (Factory New)|Mil-Spec|1370|USP-S|0.77|0.29|35.00
MP9 | Music Box (Factory New)|Mil-Spec|1371|MP9|0.17|0.09|47.00
Souvenir MP9 | Music Box (Factory New)|Mil-Spec|1371|MP9|0.17|0.09|47.00
M249 | Humidor (Factory New)|Mil-Spec|1372|M249|0.67|0.09|11.00
Souvenir M249 | Humidor (Factory New)|Mil-Spec|1372|M249|0.67|0.09|11.00
SG 553 | Desert Blossom (Factory New)|Mil-Spec|1373|SG 553|0.00|0.00|12.00
Souvenir SG 553 | Desert Blossom (Factory New)|Mil-Spec|1373|SG 553|0.00|0.00|12.00
XM1014 | Elegant Vines (Factory New)|Restricted|1374|XM1014|0.08|0.10|62.00
Souvenir XM1014 | Elegant Vines (Factory New)|Restricted|1374|XM1014|0.08|0.10|62.00
Glock-18 | Pink DDPAT (Factory New)|Restricted|1375|Glock-18|0.63|0.10|51.00
Souvenir Glock-18 | Pink DDPAT (Factory New)|Restricted|1375|Glock-18|0.63|0.10|51.00
AUG | Sand Storm (Factory New)|Restricted|1376|AUG|0.20|0.13|76.00
Souvenir AUG | Sand Storm (Factory New)|Restricted|1376|AUG|0.20|0.13|76.00
MP5-SD | Oxide Oasis (Factory New)|Classified|1377|MP5-SD|0.10|0.11|76.00
Souvenir MP5-SD | Oxide Oasis (Factory New)|Classified|1377|MP5-SD|0.10|0.11|76.00
Desert Eagle | Fennec Fox (Factory New)|Classified|1378|Desert Eagle|0.09|0.33|60.00
Souvenir Desert Eagle | Fennec Fox (Factory New)|Classified|1378|Desert Eagle|0.09|0.33|60.00
AWP | Desert Hydra (Factory New)|Covert|1379|AWP|0.17|0.04|255.00
Souvenir AWP | Desert Hydra (Factory New)|Covert|1379|AWP|0.17|0.04|255.00
Desert Eagle | Sputnik (Factory New)|Mil-Spec|1380|Desert Eagle|0.61|0.37|52.00
M4A1-S | Fizzy POP (Factory New)|Mil-Spec|1381|M4A1-S|0.17|0.23|255.00
SSG 08 | Spring Twilly (Factory New)|Mil-Spec|1382|SSG 08|0.17|0.09|44.00
AUG | Amber Fade (Factory New)|Mil-Spec|1383|AUG|0.19|0.12|75.00
UMP-45 | Full Stop (Factory New)|Mil-Spec|1384|UMP-45|0.10|0.11|64.00
Tec-9 | Safety Net (Factory New)|Mil-Spec|1385|Tec-9|0.08|0.36|22.00
R8 Revolver | Blaze (Factory New)|Mil-Spec|1386|R8 Revolver|0.08|0.08|24.00
CZ75-Auto | Syndicate (Factory New)|Restricted|1387|CZ75-Auto|0.00|0.00|10.00
AWP | POP AWP (Factory New)|Restricted|1388|AWP|0.22|0.06|53.00
P2000 | Space Race (Factory New)|Restricted|1389|P2000|0.65|0.25|36.00
MP5-SD | Autumn Twilly (Factory New)|Restricted|1390|MP5-SD|0.11|0.23|13.00
Nova | Red Quartz (Factory New)|Restricted|1391|Nova|0.42|0.12|50.00
FAMAS | Meltdown (Factory New)|Classified|1392|FAMAS|0.07|0.33|15.00
MAC-10 | Propaganda (Factory New)|Classified|1393|MAC-10|0.01|0.81|255.00
USP-S | Whiteout (Factory New)|Classified|1394|USP-S|0.15|0.09|255.00
M4A4 | The Coalition (Factory New)|Covert|1396|M4A4|0.00|0.00|8.00
MAC-10 | Strats (Factory New)|Consumer Grade|1397|MAC-10|0.12|0.08|102.00
Souvenir MAC-10 | Strats (Factory New)|Consumer Grade|1397|MAC-10|0.12|0.08|102.00
FAMAS | Faulty Wiring (Factory New)|Consumer Grade|1398|FAMAS|0.00|0.03|35.00
Souvenir FAMAS | Faulty Wiring (Factory New)|Consumer Grade|1398|FAMAS|0.00|0.03|35.00
XM1014 | Blue Tire (Factory New)|Consumer Grade|1399|XM1014|0.11|0.11|54.00
Souvenir XM1014 | Blue Tire (Factory New)|Consumer Grade|1399|XM1014|0.11|0.11|54.00
CZ75-Auto | Framework (Factory New)|Consumer Grade|1400|CZ75-Auto|0.52|0.11|72.00
Souvenir CZ75-Auto | Framework (Factory New)|Consumer Grade|1400|CZ75-Auto|0.52|0.11|72.00
Dual Berettas | Oil Change (Factory New)|Consumer Grade|1401|Dual Berettas|0.08|0.40|10.00
Souvenir Dual Berettas | Oil Change (Factory New)|Consumer Grade|1401|Dual Berettas|0.08|0.40|10.00
Glock-18 | Red Tire (Factory New)|Industrial Grade|1402|Glock-18|0.10|0.11|65.00
Souvenir Glock-18 | Red Tire (Factory New)|Industrial Grade|1402|Glock-18|0.10|0.11|65.00
UMP-45 | Mechanism (Factory New)|Industrial Grade|1403|UMP-45|0.10|0.11|74.00
Souvenir UMP-45 | Mechanism (Factory New)|Industrial Grade|1403|UMP-45|0.10|0.11|74.00
SSG 08 | Carbon Fiber (Factory New)|Industrial Grade|1404|SSG 08|0.17|0.09|23.00
Souvenir SSG 08 | Carbon Fiber (Factory New)|Industrial Grade|1404|SSG 08|0.17|0.09|23.00
PP-Bizon | Breaker Box (Factory New)|Industrial Grade|1405|PP-Bizon|0.00|0.00|10.00
Souvenir PP-Bizon | Breaker Box (Factory New)|Industrial Grade|1405|PP-Bizon|0.00|0.00|10.00
AK-47 | Green Laminate (Factory New)|Mil-Spec|1406|AK-47|0.17|0.08|61.00
Souvenir AK-47 | Green Laminate (Factory New)|Mil-Spec|1406|AK-47|0.17|0.08|61.00
P90 | Schematic (Factory New)|Mil-Spec|1407|P90|0.56|0.11|76.00
Souvenir P90 | Schematic (Factory New)|Mil-Spec|1407|P90|0.56|0.11|76.00
Nova | Interlock (Factory New)|Mil-Spec|1408|Nova|0.62|0.62|56.00
Souvenir Nova | Interlock (Factory New)|Mil-Spec|1408|Nova|0.62|0.62|56.00
Negev | Infrastructure (Factory New)|Mil-Spec|1409|Negev|0.17|0.07|14.00
Souvenir Negev | Infrastructure (Factory New)|Mil-Spec|1409|Negev|0.17|0.07|14.00
Galil AR | CAUTION! (Factory New)|Restricted|1410|Galil AR|0.21|0.14|57.00
Souvenir Galil AR | CAUTION! (Factory New)|Restricted|1410|Galil AR|0.21|0.14|57.00
MAG-7 | Prism Terrace (Factory New)|Restricted|1411|MAG-7|0.11|0.10|63.00
Souvenir MAG-7 | Prism Terrace (Factory New)|Restricted|1411|MAG-7|0.11|0.10|63.00
P250 | Digital Architect (Factory New)|Restricted|1412|P250|0.62|0.52|75.00
Souvenir P250 | Digital Architect (Factory New)|Restricted|1412|P250|0.62|0.52|75.00
Five-SeveN | Fall Hazard (Factory New)|Classified|1413|Five-SeveN|0.08|0.09|23.00
Souvenir Five-SeveN | Fall Hazard (Factory New)|Classified|1413|Five-SeveN|0.08|0.09|23.00
SG 553 | Hazard Pay (Factory New)|Classified|1414|SG 553|0.03|0.74|108.00
Souvenir SG 553 | Hazard Pay (Factory New)|Classified|1414|SG 553|0.03|0.74|108.00
M4A1-S | Imminent Danger (Factory New)|Covert|1415|M4A1-S|0.50|0.50|2.00
Souvenir M4A1-S | Imminent Danger (Factory New)|Covert|1415|M4A1-S|0.50|0.50|2.00
AUG | Plague (Factory New)|Mil-Spec|1416|AUG|0.17|0.07|14.00
Dual Berettas | Tread (Factory New)|Mil-Spec|1417|Dual Berettas|0.58|0.14|14.00
G3SG1 | Keeping Tabs (Factory New)|Mil-Spec|1418|G3SG1|0.19|0.12|58.00
MP7 | Guerrilla (Factory New)|Mil-Spec|1419|MP7|0.11|0.11|54.00
PP-Bizon | Lumen (Factory New)|Mil-Spec|1420|PP-Bizon|0.50|0.03|29.00
USP-S | Black Lotus (Factory New)|Mil-Spec|1421|USP-S|0.17|0.08|24.00
XM1014 | Watchdog (Factory New)|Mil-Spec|1422|XM1014|0.06|0.33|24.00
MAG-7 | BI83 Spectrum (Factory New)|Restricted|1423|MAG-7|0.08|0.11|38.00
FAMAS | ZX Spectron (Factory New)|Restricted|1424|FAMAS|0.46|0.08|53.00
Five-SeveN | Boost Protocol (Factory New)|Restricted|1425|Five-SeveN|0.10|0.10|48.00
MP9 | Mount Fuji (Factory New)|Restricted|1426|MP9|0.02|0.11|61.00
M4A4 | Spider Lily (Factory New)|Restricted|1427|M4A4|0.20|0.15|60.00
MAC-10 | Toybox (Factory New)|Classified|1428|MAC-10|0.08|0.09|64.00
Glock-18 | Snack Attack (Factory New)|Classified|1429|Glock-18|0.12|0.91|46.00
SSG 08 | Turbo Peek (Factory New)|Classified|1430|SSG 08|0.17|0.07|14.00
Desert Eagle | Ocean Drive (Factory New)|Covert|1431|Desert Eagle|0.04|0.84|255.00
AK-47 | Leet Museo (Factory New)|Covert|1432|AK-47|0.60|0.36|78.00
★ Bowie Knife | Freehand (Factory New)|Covert|1434|Bowie Knife|0.44|0.07|41.00
★ Bowie Knife | Lore (Factory New)|Covert|1435|Bowie Knife|0.00|0.00|15.00
★ Bowie Knife | Autotronic (Factory New)|Covert|1436|Bowie Knife|0.00|0.00|39.00
★ Bowie Knife | Black Laminate (Factory New)|Covert|1437|Bowie Knife|0.56|0.04|78.00
★ Bowie Knife | Bright Water (Factory New)|Covert|1438|Bowie Knife|0.61|0.24|74.00
★ Butterfly Knife | Freehand (Factory New)|Covert|1440|Butterfly Knife|0.58|0.05|42.00
★ Butterfly Knife | Lore (Factory New)|Covert|1441|Butterfly Knife|0.22|0.49|68.00
★ Butterfly Knife | Autotronic (Factory New)|Covert|1442|Butterfly Knife|0.99|0.92|71.00
★ Butterfly Knife | Black Laminate (Factory New)|Covert|1443|Butterfly Knife|0.56|0.06|54.00
★ Butterfly Knife | Bright Water (Factory New)|Covert|1444|Butterfly Knife|0.61|0.28|64.00
★ Falchion Knife | Freehand (Factory New)|Covert|1446|Falchion Knife|0.33|0.04|68.00
★ Falchion Knife | Lore (Factory New)|Covert|1447|Falchion Knife|0.19|0.48|73.00
★ Falchion Knife | Autotronic (Factory New)|Covert|1448|Falchion Knife|0.33|0.04|68.00
★ Falchion Knife | Black Laminate (Factory New)|Covert|1449|Falchion Knife|0.17|0.03|255.00
★ Falchion Knife | Bright Water (Factory New)|Covert|1450|Falchion Knife|0.62|0.22|82.00
★ Huntsman Knife | Freehand (Factory New)|Covert|1452|Huntsman Knife|0.50|0.05|38.00
★ Huntsman Knife | Lore (Factory New)|Covert|1453|Huntsman Knife|0.17|0.50|255.00
★ Huntsman Knife | Autotronic (Factory New)|Covert|1454|Huntsman Knife|0.50|0.05|39.00
★ Huntsman Knife | Black Laminate (Factory New)|Covert|1455|Huntsman Knife|0.46|0.06|65.00
★ Huntsman Knife | Bright Water (Factory New)|Covert|1456|Huntsman Knife|0.51|0.16|159.00
★ Shadow Daggers | Freehand (Factory New)|Covert|1458|Shadow Daggers|0.83|0.04|255.00
★ Shadow Daggers | Lore (Factory New)|Covert|1459|Shadow Daggers|0.17|0.59|255.00
★ Shadow Daggers | Autotronic (Factory New)|Covert|1460|Shadow Daggers|0.33|0.03|91.00
★ Shadow Daggers | Black Laminate (Factory New)|Covert|1461|Shadow Daggers|0.17|0.02|255.00
★ Shadow Daggers | Bright Water (Factory New)|Covert|1462|Shadow Daggers|0.60|0.46|135.00
Five-SeveN | Scrawl (Factory New)|Mil-Spec|1463|Five-SeveN|0.17|0.10|10.00
MAC-10 | Ensnared (Factory New)|Mil-Spec|1464|MAC-10|0.08|0.18|66.00
MAG-7 | Foresight (Factory New)|Mil-Spec|1465|MAG-7|0.67|0.07|27.00
MP5-SD | Necro Jr. (Factory New)|Mil-Spec|1466|MP5-SD|0.11|0.21|14.00
P2000 | Lifted Spirits (Factory New)|Mil-Spec|1467|P2000|0.08|0.25|64.00
SCAR-20 | Poultrygeist (Factory New)|Mil-Spec|1468|SCAR-20|0.00|0.00|3.00
Sawed-Off | Spirit Board (Factory New)|Mil-Spec|1469|Sawed-Off|0.08|0.10|20.00
PP-Bizon | Space Cat (Factory New)|Restricted|1470|PP-Bizon|0.56|0.05|56.00
G3SG1 | Dream Glade (Factory New)|Restricted|1471|G3SG1|0.42|0.22|93.00
M4A1-S | Night Terror (Factory New)|Restricted|1472|M4A1-S|0.10|0.12|69.00
XM1014 | Zombie Offensive (Factory New)|Restricted|1473|XM1014|0.08|0.10|62.00
USP-S | Ticket to Hell (Factory New)|Restricted|1474|USP-S|0.21|0.15|47.00
Dual Berettas | Melondrama (Factory New)|Classified|1475|Dual Berettas|0.60|0.77|22.00
FAMAS | Rapid Eye Movement (Factory New)|Classified|1476|FAMAS|0.73|0.42|48.00
MP7 | Abyssal Apparition (Factory New)|Classified|1477|MP7|0.19|0.13|63.00
AK-47 | Nightwish (Factory New)|Covert|1478|AK-47|0.17|1.00|255.00
MP9 | Starlight Protector (Factory New)|Covert|1479|MP9|0.78|0.06|47.00
FAMAS | Meow 36 (Factory New)|Mil-Spec|1480|FAMAS|0.33|1.00|1.00
Galil AR | Destroyer (Factory New)|Mil-Spec|1481|Galil AR|0.58|0.10|21.00
M4A4 | Poly Mag (Factory New)|Mil-Spec|1482|M4A4|0.06|0.52|25.00
MAC-10 | Monkeyflage (Factory New)|Mil-Spec|1483|MAC-10|0.14|0.20|83.00
Negev | Drop Me (Factory New)|Mil-Spec|1484|Negev|0.17|0.08|12.00
UMP-45 | Roadblock (Factory New)|Mil-Spec|1485|UMP-45|0.00|0.00|13.00
Glock-18 | Winterized (Factory New)|Mil-Spec|1486|Glock-18|0.11|0.08|36.00
R8 Revolver | Crazy 8 (Factory New)|Restricted|1487|R8 Revolver|0.50|0.08|12.00
M249 | Downtown (Factory New)|Restricted|1488|M249|0.08|0.10|77.00
SG 553 | Dragon Tech (Factory New)|Restricted|1489|SG 553|0.25|0.17|12.00
P90 | Vent Rush (Factory New)|Restricted|1490|P90|0.00|0.05|20.00
Dual Berettas | Flora Carnivora (Factory New)|Restricted|1491|Dual Berettas|0.71|0.36|22.00
AK-47 | Ice Coaled (Factory New)|Classified|1492|AK-47|0.67|0.07|28.00
P250 | Visions (Factory New)|Classified|1493|P250|0.33|0.13|46.00
Sawed-Off | Kiss♥Love (Factory New)|Classified|1494|Sawed-Off|0.81|0.33|24.00
USP-S | Printstream (Factory New)|Covert|1495|USP-S|0.13|0.08|60.00
AWP | Chromatic Aberration (Factory New)|Covert|1496|AWP|0.33|1.00|1.00
MAG-7 | Insomnia (Factory New)|Mil-Spec|1497|MAG-7|0.11|0.12|52.00
MP9 | Featherweight (Factory New)|Mil-Spec|1498|MP9|0.14|0.10|69.00
SCAR-20 | Fragments (Factory New)|Mil-Spec|1499|SCAR-20|0.17|0.10|10.00
P250 | Re.built (Factory New)|Mil-Spec|1500|P250|0.11|0.14|21.00
MP5-SD | Liquidation (Factory New)|Mil-Spec|1501|MP5-SD|0.17|0.07|15.00
SG 553 | Cyberforce (Factory New)|Mil-Spec|1502|SG 553|0.00|0.00|9.00
Tec-9 | Rebel (Factory New)|Mil-Spec|1503|Tec-9|0.00|0.00|4.00
M4A1-S | Emphorosaur-S (Factory New)|Restricted|1504|M4A1-S|0.37|0.07|70.00
Glock-18 | Umbral Rabbit (Factory New)|Restricted|1505|Glock-18|0.45|0.21|76.00
R8 Revolver | Banana Cannon (Factory New)|Restricted|1507|R8 Revolver|0.13|0.25|20.00
P90 | Neoqueen (Factory New)|Restricted|1508|P90|0.67|0.12|17.00
UMP-45 | Wild Child (Factory New)|Classified|1509|UMP-45|0.00|0.00|3.00
P2000 | Wicked Sick (Factory New)|Classified|1510|P2000|0.19|0.07|254.00
AK-47 | Head Shot (Factory New)|Covert|1511|AK-47|0.17|0.06|16.00
M4A4 | Temukau (Factory New)|Covert|1512|M4A4|0.10|0.11|87.00
AWP | Duality (Factory New)|Classified|1513|AWP|0.11|0.16|19.00
R8 Revolver | Inlay (Factory New)|Consumer Grade|1514|R8 Revolver|0.00|0.00|3.00
Souvenir R8 Revolver | Inlay (Factory New)|Consumer Grade|1514|R8 Revolver|0.00|0.00|3.00
M249 | Submerged (Factory New)|Consumer Grade|1515|M249|0.06|0.37|132.00
Souvenir M249 | Submerged (Factory New)|Consumer Grade|1515|M249|0.06|0.37|132.00
XM1014 | Hieroglyph (Factory New)|Consumer Grade|1516|XM1014|0.09|0.44|52.00
Souvenir XM1014 | Hieroglyph (Factory New)|Consumer Grade|1516|XM1014|0.09|0.44|52.00
MP7 | Sunbaked (Factory New)|Consumer Grade|1517|MP7|0.08|0.12|16.00
Souvenir MP7 | Sunbaked (Factory New)|Consumer Grade|1517|MP7|0.08|0.12|16.00
AUG | Snake Pit (Factory New)|Consumer Grade|1518|AUG|0.08|0.22|9.00
Souvenir AUG | Snake Pit (Factory New)|Consumer Grade|1518|AUG|0.08|0.22|9.00
M4A1-S | Mud-Spec (Factory New)|Industrial Grade|1519|M4A1-S|0.17|0.06|16.00
Souvenir M4A1-S | Mud-Spec (Factory New)|Industrial Grade|1519|M4A1-S|0.17|0.06|16.00
SSG 08 | Azure Glyph (Factory New)|Industrial Grade|1520|SSG 08|0.17|0.07|15.00
Souvenir SSG 08 | Azure Glyph (Factory New)|Industrial Grade|1520|SSG 08|0.17|0.07|15.00
MAC-10 | Echoing Sands (Factory New)|Industrial Grade|1521|MAC-10|0.10|0.11|65.00
Souvenir MAC-10 | Echoing Sands (Factory New)|Industrial Grade|1521|MAC-10|0.10|0.11|65.00
USP-S | Desert Tactical (Factory New)|Industrial Grade|1522|USP-S|0.11|0.19|16.00
Souvenir USP-S | Desert Tactical (Factory New)|Industrial Grade|1522|USP-S|0.11|0.19|16.00
AK-47 | Steel Delta (Factory New)|Mil-Spec|1523|AK-47|0.17|0.08|13.00
Souvenir AK-47 | Steel Delta (Factory New)|Mil-Spec|1523|AK-47|0.17|0.08|13.00
AWP | Black Nile (Factory New)|Mil-Spec|1524|AWP|0.17|0.12|17.00
Souvenir AWP | Black Nile (Factory New)|Mil-Spec|1524|AWP|0.17|0.12|17.00
Tec-9 | Mummy's Rot (Factory New)|Mil-Spec|1525|Tec-9|0.11|0.23|13.00
Souvenir Tec-9 | Mummy's Rot (Factory New)|Mil-Spec|1525|Tec-9|0.11|0.23|13.00
MAG-7 | Copper Coated (Factory New)|Mil-Spec|1526|MAG-7|0.08|0.08|26.00
Souvenir MAG-7 | Copper Coated (Factory New)|Mil-Spec|1526|MAG-7|0.08|0.08|26.00
Glock-18 | Ramese's Reach (Factory New)|Restricted|1527|Glock-18|0.10|0.44|16.00
Souvenir Glock-18 | Ramese's Reach (Factory New)|Restricted|1527|Glock-18|0.10|0.44|16.00
Nova | Sobek's Bite (Factory New)|Restricted|1528|Nova|0.12|0.40|10.00
Souvenir Nova | Sobek's Bite (Factory New)|Restricted|1528|Nova|0.12|0.40|10.00
P90 | ScaraB Rush (Factory New)|Restricted|1529|P90|0.08|0.12|17.00
Souvenir P90 | ScaraB Rush (Factory New)|Restricted|1529|P90|0.08|0.12|17.00
FAMAS | Waters of Nephthys (Factory New)|Classified|1530|FAMAS|0.10|0.32|56.00
Souvenir FAMAS | Waters of Nephthys (Factory New)|Classified|1530|FAMAS|0.10|0.32|56.00
P250 | Apep's Curse (Factory New)|Classified|1531|P250|0.10|0.56|9.00
Souvenir P250 | Apep's Curse (Factory New)|Classified|1531|P250|0.10|0.56|9.00
M4A4 | Eye of Horus (Factory New)|Covert|1532|M4A4|0.15|0.53|36.00
Souvenir M4A4 | Eye of Horus (Factory New)|Covert|1532|M4A4|0.15|0.53|36.00
Tec-9 | Slag (Factory New)|Mil-Spec|1533|Tec-9|0.08|0.24|78.00
XM1014 | Irezumi (Factory New)|Mil-Spec|1534|XM1014|0.11|0.27|22.00
UMP-45 | Motorized (Factory New)|Mil-Spec|1535|UMP-45|0.17|0.09|11.00
SSG 08 | Dezastre (Factory New)|Mil-Spec|1536|SSG 08|0.17|0.05|19.00
Dual Berettas | Hideout (Factory New)|Mil-Spec|1537|Dual Berettas|0.00|0.00|13.00
Nova | Dark Sigil (Factory New)|Mil-Spec|1538|Nova|0.11|0.12|24.00
MAC-10 | Light Box (Factory New)|Mil-Spec|1539|MAC-10|0.50|0.03|37.00
Glock-18 | Block-18 (Factory New)|Restricted|1540|Glock-18|0.25|0.03|66.00
M4A4 | Etch Lord (Factory New)|Restricted|1541|M4A4|0.00|0.25|4.00
MP7 | Just Smile (Factory New)|Restricted|1542|MP7|0.42|0.09|22.00
Sawed-Off | Analog Input (Factory New)|Restricted|1543|Sawed-Off|0.17|0.11|9.00
Five-SeveN | Hybrid (Factory New)|Restricted|1544|Five-SeveN|0.00|0.07|15.00
M4A1-S | Black Lotus (Factory New)|Classified|1545|M4A1-S|0.39|0.10|30.00
Zeus x27 | Olympus (Factory New)|Classified|1546|Zeus x27|0.57|0.34|86.00
USP-S | Jawbreaker (Factory New)|Classified|1547|USP-S|0.83|0.22|9.00
AWP | Chrome Cannon (Factory New)|Covert|1548|AWP|0.17|0.11|18.00
AK-47 | Inheritance (Factory New)|Covert|1549|AK-47|0.17|0.02|255.00
★ Kukri Knife | Forest DDPAT (Factory New)|Covert|1550|Kukri Knife|0.28|0.32|113.00
★ Kukri Knife | Fade (Factory New)|Covert|1552|Kukri Knife|0.33|0.02|57.00
★ Kukri Knife | Blue Steel (Factory New)|Covert|1553|Kukri Knife|0.33|0.02|57.00
★ Kukri Knife | Stained (Factory New)|Covert|1554|Kukri Knife|0.33|0.02|57.00
★ Kukri Knife | Case Hardened (Factory New)|Covert|1555|Kukri Knife|0.25|0.08|53.00
★ Kukri Knife | Slaughter (Factory New)|Covert|1556|Kukri Knife|0.33|0.02|57.00
★ Kukri Knife | Safari Mesh (Factory New)|Covert|1557|Kukri Knife|0.23|0.16|108.00
★ Kukri Knife | Boreal Forest (Factory New)|Covert|1558|Kukri Knife|0.13|0.18|118.00
★ Kukri Knife | Urban Masked (Factory New)|Covert|1559|Kukri Knife|0.50|0.01|141.00
★ Kukri Knife | Scorched (Factory New)|Covert|1560|Kukri Knife|0.67|0.02|45.00
★ Kukri Knife | Night Stripe (Factory New)|Covert|1561|Kukri Knife|0.54|0.21|84.00
★ Kukri Knife | Vanilla (Factory New)|Covert|1562|Kukri Knife|0.08|0.09|23.00`;

const AVERAGE_RAW = `UMP-45 | Caramel (Factory New)|Consumer Grade|1|UMP-45|0.11|0.40|140.00
AUG | Hot Rod (Factory New)|Mil-Spec|2|AUG|0.03|0.23|117.00
Glock-18 | Fade (Factory New)|Restricted|3|Glock-18|0.01|0.15|95.00
MP9 | Bulldozer (Factory New)|Restricted|4|MP9|0.13|0.55|148.00
SG 553 | Tornado (Factory New)|Consumer Grade|5|SG 553|0.54|0.03|118.00
Negev | Anodized Navy (Factory New)|Mil-Spec|6|Negev|0.33|0.02|89.00
Five-SeveN | Candy Apple (Factory New)|Industrial Grade|7|Five-SeveN|0.01|0.38|133.00
FAMAS | Contrast Spray (Factory New)|Consumer Grade|8|FAMAS|0.12|0.10|145.00
M249 | Blizzard Marbleized (Factory New)|Industrial Grade|9|M249|0.22|0.04|158.00
MP7 | Whiteout (Factory New)|Mil-Spec|10|MP7|0.14|0.10|165.00
P2000 | Silver (Factory New)|Mil-Spec|11|P2000|0.19|0.05|142.00
G3SG1 | Arctic Camo (Factory New)|Industrial Grade|12|G3SG1|0.27|0.04|129.00
Galil AR | Winter Forest (Factory New)|Industrial Grade|13|Galil AR|0.22|0.04|156.00
XM1014 | Fallout Warning (Factory New)|Industrial Grade|14|XM1014|0.00|0.28|95.00
Souvenir XM1014 | Fallout Warning (Factory New)|Industrial Grade|14|XM1014|0.00|0.28|95.00
M4A4 | Radiation Hazard (Factory New)|Mil-Spec|15|M4A4|0.01|0.44|108.00
Souvenir M4A4 | Radiation Hazard (Factory New)|Mil-Spec|15|M4A4|0.01|0.44|108.00
UMP-45 | Fallout Warning (Factory New)|Industrial Grade|16|UMP-45|0.01|0.22|97.00
Souvenir UMP-45 | Fallout Warning (Factory New)|Industrial Grade|16|UMP-45|0.01|0.22|97.00
PP-Bizon | Irradiated Alert (Factory New)|Consumer Grade|17|PP-Bizon|0.09|0.28|88.00
Souvenir PP-Bizon | Irradiated Alert (Factory New)|Consumer Grade|17|PP-Bizon|0.09|0.28|88.00
P90 | Fallout Warning (Factory New)|Industrial Grade|18|P90|0.02|0.27|100.00
Souvenir P90 | Fallout Warning (Factory New)|Industrial Grade|18|P90|0.02|0.27|100.00
Tec-9 | Nuclear Threat (Factory New)|Restricted|19|Tec-9|0.29|0.45|121.00
Souvenir Tec-9 | Nuclear Threat (Factory New)|Restricted|19|Tec-9|0.29|0.45|121.00
P250 | Nuclear Threat (Factory New)|Restricted|20|P250|0.29|0.45|130.00
Souvenir P250 | Nuclear Threat (Factory New)|Restricted|20|P250|0.29|0.45|130.00
Sawed-Off | Irradiated Alert (Factory New)|Consumer Grade|21|Sawed-Off|0.08|0.33|88.00
Souvenir Sawed-Off | Irradiated Alert (Factory New)|Consumer Grade|21|Sawed-Off|0.08|0.33|88.00
MAG-7 | Irradiated Alert (Factory New)|Consumer Grade|22|MAG-7|0.09|0.27|85.00
Souvenir MAG-7 | Irradiated Alert (Factory New)|Consumer Grade|22|MAG-7|0.09|0.27|85.00
SCAR-20 | Splash Jam (Factory New)|Classified|23|SCAR-20|0.92|0.33|105.00
Nova | Modern Hunter (Factory New)|Mil-Spec|24|Nova|0.12|0.22|130.00
PP-Bizon | Forest Leaves (Factory New)|Consumer Grade|25|PP-Bizon|0.15|0.36|86.00
PP-Bizon | Modern Hunter (Factory New)|Mil-Spec|26|PP-Bizon|0.12|0.25|132.00
XM1014 | Blaze Orange (Factory New)|Mil-Spec|27|XM1014|0.06|0.61|148.00
P250 | Modern Hunter (Factory New)|Mil-Spec|28|P250|0.12|0.27|147.00
MAC-10 | Tornado (Factory New)|Consumer Grade|29|MAC-10|0.58|0.05|127.00
Nova | Blaze Orange (Factory New)|Mil-Spec|30|Nova|0.05|0.59|132.00
XM1014 | Grassland (Factory New)|Consumer Grade|31|XM1014|0.13|0.28|155.00
P2000 | Grassland Leaves (Factory New)|Industrial Grade|32|P2000|0.12|0.27|129.00
M4A4 | Modern Hunter (Factory New)|Restricted|33|M4A4|0.13|0.21|130.00
Nova | Walnut (Factory New)|Consumer Grade|34|Nova|0.06|0.24|99.00
Souvenir Nova | Walnut (Factory New)|Consumer Grade|34|Nova|0.06|0.24|99.00
M4A4 | Tornado (Factory New)|Industrial Grade|35|M4A4|0.14|0.05|132.00
Souvenir M4A4 | Tornado (Factory New)|Industrial Grade|35|M4A4|0.14|0.05|132.00
Tec-9 | Brass (Factory New)|Mil-Spec|36|Tec-9|0.16|0.22|82.00
Souvenir Tec-9 | Brass (Factory New)|Mil-Spec|36|Tec-9|0.16|0.22|82.00
P250 | Gunsmoke (Factory New)|Industrial Grade|37|P250|0.09|0.21|140.00
Souvenir P250 | Gunsmoke (Factory New)|Industrial Grade|37|P250|0.09|0.21|140.00
Dual Berettas | Anodized Navy (Factory New)|Mil-Spec|38|Dual Berettas|0.57|0.16|100.00
Souvenir Dual Berettas | Anodized Navy (Factory New)|Mil-Spec|38|Dual Berettas|0.57|0.16|100.00
MAG-7 | Sand Dune (Factory New)|Consumer Grade|39|MAG-7|0.12|0.28|170.00
Souvenir MAG-7 | Sand Dune (Factory New)|Consumer Grade|39|MAG-7|0.12|0.28|170.00
AK-47 | Black Laminate (Factory New)|Mil-Spec|40|AK-47|0.12|0.10|99.00
Souvenir AK-47 | Black Laminate (Factory New)|Mil-Spec|40|AK-47|0.12|0.10|99.00
PP-Bizon | Carbon Fiber (Factory New)|Industrial Grade|41|PP-Bizon|0.39|0.03|93.00
Souvenir PP-Bizon | Carbon Fiber (Factory New)|Industrial Grade|41|PP-Bizon|0.39|0.03|93.00
MAC-10 | Urban DDPAT (Factory New)|Consumer Grade|42|MAC-10|0.14|0.12|144.00
Souvenir MAC-10 | Urban DDPAT (Factory New)|Consumer Grade|42|MAC-10|0.14|0.12|144.00
P90 | Glacier Mesh (Factory New)|Mil-Spec|43|P90|0.45|0.07|151.00
Souvenir P90 | Glacier Mesh (Factory New)|Mil-Spec|43|P90|0.45|0.07|151.00
XM1014 | Urban Perforated (Factory New)|Consumer Grade|45|XM1014|0.17|0.06|122.00
Souvenir XM1014 | Urban Perforated (Factory New)|Consumer Grade|45|XM1014|0.17|0.06|122.00
M4A4 | Jungle Tiger (Factory New)|Industrial Grade|46|M4A4|0.17|0.12|94.00
SSG 08 | Lichen Dashed (Factory New)|Consumer Grade|47|SSG 08|0.17|0.21|94.00
Five-SeveN | Jungle (Factory New)|Consumer Grade|48|Five-SeveN|0.20|0.34|155.00
Tec-9 | Ossified (Factory New)|Mil-Spec|49|Tec-9|0.22|0.16|79.00
Nova | Forest Leaves (Factory New)|Consumer Grade|50|Nova|0.15|0.39|87.00
AK-47 | Jungle Spray (Factory New)|Industrial Grade|51|AK-47|0.20|0.29|94.00
AK-47 | Predator (Factory New)|Industrial Grade|52|AK-47|0.10|0.38|91.00
SCAR-20 | Palm (Factory New)|Industrial Grade|53|SCAR-20|0.12|0.28|138.00
Sawed-Off | Copper (Factory New)|Mil-Spec|54|Sawed-Off|0.06|0.41|110.00
M4A4 | Desert Storm (Factory New)|Industrial Grade|55|M4A4|0.09|0.27|131.00
Glock-18 | Brass (Factory New)|Restricted|57|Glock-18|0.16|0.19|98.00
P2000 | Scorpion (Factory New)|Restricted|58|P2000|0.09|0.30|96.00
Desert Eagle | Blaze (Factory New)|Restricted|59|Desert Eagle|0.06|0.60|104.00
AWP | Snake Camo (Factory New)|Mil-Spec|60|AWP|0.11|0.25|108.00
AWP | BOOM (Factory New)|Classified|62|AWP|0.04|0.50|141.00
MAG-7 | Memento (Factory New)|Mil-Spec|63|MAG-7|0.08|0.29|86.00
Galil AR | Orange DDPAT (Factory New)|Restricted|64|Galil AR|0.08|0.40|118.00
P250 | Splash (Factory New)|Restricted|66|P250|0.07|0.42|113.00
Sawed-Off | Orange DDPAT (Factory New)|Restricted|67|Sawed-Off|0.08|0.39|103.00
M4A4 | Faded Zebra (Factory New)|Mil-Spec|68|M4A4|0.14|0.10|108.00
AK-47 | Red Laminate (Factory New)|Classified|69|AK-47|0.02|0.47|120.00
AWP | Lightning Strike (Factory New)|Covert|70|AWP|0.78|0.26|92.00
AUG | Wings (Factory New)|Mil-Spec|71|AUG|0.15|0.07|111.00
SG 553 | Ultraviolet (Factory New)|Mil-Spec|72|SG 553|0.76|0.30|96.00
AK-47 | Case Hardened (Factory New)|Classified|73|AK-47|0.04|0.21|80.00
Desert Eagle | Hypnotic (Factory New)|Classified|74|Desert Eagle|0.10|0.07|113.00
Glock-18 | Dragon Tattoo (Factory New)|Restricted|75|Glock-18|0.28|0.03|101.00
SCAR-20 | Emerald (Factory New)|Restricted|79|SCAR-20|0.39|0.28|81.00
MP7 | Groundwater (Factory New)|Consumer Grade|80|MP7|0.19|0.25|148.00
AUG | Anodized Navy (Factory New)|Mil-Spec|81|AUG|0.54|0.04|113.00
FAMAS | Spitfire (Factory New)|Restricted|82|FAMAS|0.09|0.31|108.00
PP-Bizon | Rust Coat (Factory New)|Mil-Spec|83|PP-Bizon|0.00|0.00|85.00
XM1014 | Jungle (Factory New)|Consumer Grade|84|XM1014|0.23|0.28|142.00
Five-SeveN | Anodized Gunmetal (Factory New)|Consumer Grade|85|Five-SeveN|0.17|0.06|95.00
P250 | Facets (Factory New)|Industrial Grade|86|P250|0.17|0.05|105.00
MP9 | Dry Season (Factory New)|Consumer Grade|87|MP9|0.11|0.38|127.00
Sawed-Off | Mosaico (Factory New)|Industrial Grade|88|Sawed-Off|0.11|0.31|106.00
MAG-7 | Hazard (Factory New)|Mil-Spec|89|MAG-7|0.13|0.61|137.00
Negev | Palm (Factory New)|Industrial Grade|90|Negev|0.12|0.30|147.00
Tec-9 | Tornado (Factory New)|Consumer Grade|91|Tec-9|0.13|0.04|124.00
M249 | Jungle DDPAT (Factory New)|Consumer Grade|92|M249|0.17|0.25|87.00
SSG 08 | Mayan Dreams (Factory New)|Industrial Grade|93|SSG 08|0.09|0.25|102.00
Glock-18 | Sand Dune (Factory New)|Industrial Grade|94|Glock-18|0.11|0.26|174.00
USP-S | Overgrowth (Factory New)|Restricted|95|USP-S|0.19|0.41|127.00
AWP | Graphite (Factory New)|Classified|96|AWP|0.22|0.03|88.00
G3SG1 | Demeter (Factory New)|Mil-Spec|97|G3SG1|0.52|0.10|87.00
Galil AR | Shattered (Factory New)|Mil-Spec|98|Galil AR|0.15|0.06|145.00
SG 553 | Wave Spray (Factory New)|Mil-Spec|99|SG 553|0.56|0.21|116.00
AK-47 | Fire Serpent (Factory New)|Covert|100|AK-47|0.12|0.24|100.00
UMP-45 | Bone Pile (Factory New)|Mil-Spec|101|UMP-45|0.21|0.22|109.00
MAC-10 | Graven (Factory New)|Restricted|102|MAC-10|0.17|0.25|118.00
P2000 | Ocean Foam (Factory New)|Classified|103|P2000|0.56|0.14|111.00
Dual Berettas | Black Limba (Factory New)|Mil-Spec|104|Dual Berettas|0.09|0.27|105.00
M4A4 | Zirka (Factory New)|Restricted|105|M4A4|0.14|0.26|90.00
Desert Eagle | Golden Koi (Factory New)|Covert|106|Desert Eagle|0.18|0.13|139.00
P90 | Emerald Dragon (Factory New)|Classified|107|P90|0.19|0.22|110.00
Nova | Tempest (Factory New)|Mil-Spec|108|Nova|0.61|0.36|98.00
SSG 08 | Blood in the Water (Factory New)|Covert|110|SSG 08|0.11|0.07|91.00
USP-S | Serum (Factory New)|Classified|111|USP-S|0.06|0.25|76.00
M4A1-S | Blood Tiger (Factory New)|Mil-Spec|112|M4A1-S|0.07|0.31|78.00
MP9 | Hypnotic (Factory New)|Restricted|113|MP9|0.11|0.08|108.00
P90 | Cold Blooded (Factory New)|Classified|114|P90|0.02|0.37|111.00
Dual Berettas | Hemoglobin (Factory New)|Restricted|115|Dual Berettas|0.02|0.35|115.00
P250 | Hive (Factory New)|Mil-Spec|116|P250|0.05|0.48|92.00
Five-SeveN | Case Hardened (Factory New)|Restricted|117|Five-SeveN|0.39|0.04|85.00
FAMAS | Hexane (Factory New)|Mil-Spec|118|FAMAS|0.75|0.12|69.00
Tec-9 | Blue Titanium (Factory New)|Mil-Spec|119|Tec-9|0.54|0.10|93.00
Nova | Graphite (Factory New)|Restricted|120|Nova|0.46|0.05|77.00
SCAR-20 | Crimson Web (Factory New)|Mil-Spec|121|SCAR-20|0.01|0.40|91.00
G3SG1 | Desert Storm (Factory New)|Consumer Grade|122|G3SG1|0.09|0.26|111.00
Souvenir G3SG1 | Desert Storm (Factory New)|Consumer Grade|122|G3SG1|0.09|0.26|111.00
P250 | Sand Dune (Factory New)|Consumer Grade|123|P250|0.11|0.26|171.00
Souvenir P250 | Sand Dune (Factory New)|Consumer Grade|123|P250|0.11|0.26|171.00
Sawed-Off | Snake Camo (Factory New)|Industrial Grade|124|Sawed-Off|0.10|0.33|117.00
Souvenir Sawed-Off | Snake Camo (Factory New)|Industrial Grade|124|Sawed-Off|0.10|0.33|117.00
SG 553 | Damascus Steel (Factory New)|Mil-Spec|125|SG 553|0.33|0.02|100.00
Souvenir SG 553 | Damascus Steel (Factory New)|Mil-Spec|125|SG 553|0.33|0.02|100.00
AK-47 | Safari Mesh (Factory New)|Industrial Grade|126|AK-47|0.14|0.26|109.00
Souvenir AK-47 | Safari Mesh (Factory New)|Industrial Grade|126|AK-47|0.14|0.26|109.00
SCAR-20 | Sand Mesh (Factory New)|Consumer Grade|127|SCAR-20|0.11|0.32|104.00
Souvenir SCAR-20 | Sand Mesh (Factory New)|Consumer Grade|127|SCAR-20|0.11|0.32|104.00
Five-SeveN | Orange Peel (Factory New)|Industrial Grade|128|Five-SeveN|0.06|0.61|150.00
Souvenir Five-SeveN | Orange Peel (Factory New)|Industrial Grade|128|Five-SeveN|0.06|0.61|150.00
P2000 | Amber Fade (Factory New)|Restricted|129|P2000|0.11|0.29|100.00
Souvenir P2000 | Amber Fade (Factory New)|Restricted|129|P2000|0.11|0.29|100.00
P90 | Sand Spray (Factory New)|Consumer Grade|130|P90|0.11|0.32|119.00
Souvenir P90 | Sand Spray (Factory New)|Consumer Grade|130|P90|0.11|0.32|119.00
MP9 | Sand Dashed (Factory New)|Consumer Grade|131|MP9|0.11|0.34|122.00
Souvenir MP9 | Sand Dashed (Factory New)|Consumer Grade|131|MP9|0.11|0.34|122.00
PP-Bizon | Brass (Factory New)|Mil-Spec|132|PP-Bizon|0.15|0.30|92.00
Souvenir PP-Bizon | Brass (Factory New)|Mil-Spec|132|PP-Bizon|0.15|0.30|92.00
MAC-10 | Palm (Factory New)|Industrial Grade|133|MAC-10|0.12|0.29|154.00
Souvenir MAC-10 | Palm (Factory New)|Industrial Grade|133|MAC-10|0.12|0.29|154.00
Tec-9 | VariCamo (Factory New)|Industrial Grade|134|Tec-9|0.11|0.26|134.00
Souvenir Tec-9 | VariCamo (Factory New)|Industrial Grade|134|Tec-9|0.11|0.26|134.00
Nova | Predator (Factory New)|Consumer Grade|135|Nova|0.10|0.36|89.00
Souvenir Nova | Predator (Factory New)|Consumer Grade|135|Nova|0.10|0.36|89.00
M4A1-S | VariCamo (Factory New)|Mil-Spec|136|M4A1-S|0.11|0.27|132.00
Souvenir M4A1-S | VariCamo (Factory New)|Mil-Spec|136|M4A1-S|0.11|0.27|132.00
XM1014 | CaliCamo (Factory New)|Industrial Grade|137|XM1014|0.08|0.36|137.00
Souvenir XM1014 | CaliCamo (Factory New)|Industrial Grade|137|XM1014|0.08|0.36|137.00
Tec-9 | Groundwater (Factory New)|Consumer Grade|138|Tec-9|0.20|0.23|134.00
Souvenir Tec-9 | Groundwater (Factory New)|Consumer Grade|138|Tec-9|0.20|0.23|134.00
Sawed-Off | Full Stop (Factory New)|Mil-Spec|139|Sawed-Off|0.03|0.45|88.00
Souvenir Sawed-Off | Full Stop (Factory New)|Mil-Spec|139|Sawed-Off|0.03|0.45|88.00
AUG | Contractor (Factory New)|Consumer Grade|140|AUG|0.17|0.13|114.00
Souvenir AUG | Contractor (Factory New)|Consumer Grade|140|AUG|0.17|0.13|114.00
M4A1-S | Boreal Forest (Factory New)|Industrial Grade|141|M4A1-S|0.17|0.27|99.00
Souvenir M4A1-S | Boreal Forest (Factory New)|Industrial Grade|141|M4A1-S|0.17|0.27|99.00
FAMAS | Colony (Factory New)|Consumer Grade|142|FAMAS|0.15|0.27|143.00
Souvenir FAMAS | Colony (Factory New)|Consumer Grade|142|FAMAS|0.15|0.27|143.00
UMP-45 | Gunsmoke (Factory New)|Industrial Grade|143|UMP-45|0.09|0.18|121.00
Souvenir UMP-45 | Gunsmoke (Factory New)|Industrial Grade|143|UMP-45|0.09|0.18|121.00
Nova | Sand Dune (Factory New)|Consumer Grade|145|Nova|0.12|0.27|166.00
Souvenir Nova | Sand Dune (Factory New)|Consumer Grade|145|Nova|0.12|0.27|166.00
Glock-18 | Candy Apple (Factory New)|Mil-Spec|146|Glock-18|0.01|0.34|137.00
Souvenir Glock-18 | Candy Apple (Factory New)|Mil-Spec|146|Glock-18|0.01|0.34|137.00
P2000 | Granite Marbleized (Factory New)|Industrial Grade|147|P2000|0.15|0.12|136.00
Souvenir P2000 | Granite Marbleized (Factory New)|Industrial Grade|147|P2000|0.15|0.12|136.00
Dual Berettas | Stained (Factory New)|Industrial Grade|148|Dual Berettas|0.22|0.03|103.00
Souvenir Dual Berettas | Stained (Factory New)|Industrial Grade|148|Dual Berettas|0.22|0.03|103.00
MP7 | Anodized Navy (Factory New)|Mil-Spec|149|MP7|0.56|0.11|102.00
Souvenir MP7 | Anodized Navy (Factory New)|Mil-Spec|149|MP7|0.56|0.11|102.00
PP-Bizon | Sand Dashed (Factory New)|Consumer Grade|150|PP-Bizon|0.11|0.33|115.00
Souvenir PP-Bizon | Sand Dashed (Factory New)|Consumer Grade|150|PP-Bizon|0.11|0.33|115.00
Nova | Candy Apple (Factory New)|Industrial Grade|151|Nova|0.01|0.47|140.00
Souvenir Nova | Candy Apple (Factory New)|Industrial Grade|151|Nova|0.01|0.47|140.00
P250 | Boreal Forest (Factory New)|Consumer Grade|152|P250|0.18|0.26|103.00
Souvenir P250 | Boreal Forest (Factory New)|Consumer Grade|152|P250|0.18|0.26|103.00
USP-S | Night Ops (Factory New)|Mil-Spec|153|USP-S|0.42|0.04|99.00
Souvenir USP-S | Night Ops (Factory New)|Mil-Spec|153|USP-S|0.42|0.04|99.00
Desert Eagle | Mudder (Factory New)|Industrial Grade|154|Desert Eagle|0.11|0.36|108.00
Souvenir Desert Eagle | Mudder (Factory New)|Industrial Grade|154|Desert Eagle|0.11|0.36|108.00
XM1014 | Blue Spruce (Factory New)|Consumer Grade|155|XM1014|0.41|0.19|150.00
Souvenir XM1014 | Blue Spruce (Factory New)|Consumer Grade|155|XM1014|0.41|0.19|150.00
AUG | Storm (Factory New)|Consumer Grade|156|AUG|0.53|0.07|135.00
Souvenir AUG | Storm (Factory New)|Consumer Grade|156|AUG|0.53|0.07|135.00
AWP | Safari Mesh (Factory New)|Industrial Grade|157|AWP|0.15|0.17|95.00
Souvenir AWP | Safari Mesh (Factory New)|Industrial Grade|157|AWP|0.15|0.17|95.00
Dual Berettas | Cobalt Quartz (Factory New)|Restricted|158|Dual Berettas|0.58|0.34|97.00
Souvenir Dual Berettas | Cobalt Quartz (Factory New)|Restricted|158|Dual Berettas|0.58|0.34|97.00
Galil AR | Sage Spray (Factory New)|Consumer Grade|159|Galil AR|0.13|0.20|153.00
Souvenir Galil AR | Sage Spray (Factory New)|Consumer Grade|159|Galil AR|0.13|0.20|153.00
PP-Bizon | Night Ops (Factory New)|Industrial Grade|160|PP-Bizon|0.53|0.06|90.00
Souvenir PP-Bizon | Night Ops (Factory New)|Industrial Grade|160|PP-Bizon|0.53|0.06|90.00
P90 | Teardown (Factory New)|Mil-Spec|161|P90|0.76|0.21|78.00
Souvenir P90 | Teardown (Factory New)|Mil-Spec|161|P90|0.76|0.21|78.00
SG 553 | Waves Perforated (Factory New)|Consumer Grade|162|SG 553|0.57|0.21|110.00
Souvenir SG 553 | Waves Perforated (Factory New)|Consumer Grade|162|SG 553|0.57|0.21|110.00
G3SG1 | Jungle Dashed (Factory New)|Consumer Grade|163|G3SG1|0.21|0.23|81.00
Souvenir G3SG1 | Jungle Dashed (Factory New)|Consumer Grade|163|G3SG1|0.21|0.23|81.00
FAMAS | Cyanospatter (Factory New)|Industrial Grade|164|FAMAS|0.52|0.21|121.00
Souvenir FAMAS | Cyanospatter (Factory New)|Industrial Grade|164|FAMAS|0.52|0.21|121.00
XM1014 | Blue Steel (Factory New)|Industrial Grade|165|XM1014|0.50|0.03|89.00
Souvenir XM1014 | Blue Steel (Factory New)|Industrial Grade|165|XM1014|0.50|0.03|89.00
SG 553 | Anodized Navy (Factory New)|Mil-Spec|166|SG 553|0.50|0.05|87.00
Souvenir SG 553 | Anodized Navy (Factory New)|Mil-Spec|166|SG 553|0.50|0.05|87.00
P250 | Bone Mask (Factory New)|Consumer Grade|167|P250|0.15|0.18|128.00
Souvenir P250 | Bone Mask (Factory New)|Consumer Grade|167|P250|0.15|0.18|128.00
Negev | CaliCamo (Factory New)|Industrial Grade|168|Negev|0.09|0.35|120.00
Souvenir Negev | CaliCamo (Factory New)|Industrial Grade|168|Negev|0.09|0.35|120.00
Five-SeveN | Contractor (Factory New)|Consumer Grade|169|Five-SeveN|0.12|0.26|138.00
Souvenir Five-SeveN | Contractor (Factory New)|Consumer Grade|169|Five-SeveN|0.12|0.26|138.00
AUG | Colony (Factory New)|Consumer Grade|170|AUG|0.15|0.21|142.00
Souvenir AUG | Colony (Factory New)|Consumer Grade|170|AUG|0.15|0.21|142.00
MAG-7 | Bulldozer (Factory New)|Restricted|171|MAG-7|0.14|0.45|141.00
Souvenir MAG-7 | Bulldozer (Factory New)|Restricted|171|MAG-7|0.14|0.45|141.00
MAC-10 | Amber Fade (Factory New)|Mil-Spec|172|MAC-10|0.10|0.23|103.00
Souvenir MAC-10 | Amber Fade (Factory New)|Mil-Spec|172|MAC-10|0.10|0.23|103.00
G3SG1 | Safari Mesh (Factory New)|Consumer Grade|173|G3SG1|0.15|0.24|99.00
Souvenir G3SG1 | Safari Mesh (Factory New)|Consumer Grade|173|G3SG1|0.15|0.24|99.00
SSG 08 | Tropical Storm (Factory New)|Industrial Grade|174|SSG 08|0.53|0.11|98.00
Souvenir SSG 08 | Tropical Storm (Factory New)|Industrial Grade|174|SSG 08|0.53|0.11|98.00
P90 | Scorched (Factory New)|Consumer Grade|175|P90|0.10|0.10|100.00
Souvenir P90 | Scorched (Factory New)|Consumer Grade|175|P90|0.10|0.10|100.00
SG 553 | Gator Mesh (Factory New)|Industrial Grade|176|SG 553|0.17|0.44|90.00
Souvenir SG 553 | Gator Mesh (Factory New)|Industrial Grade|176|SG 553|0.17|0.44|90.00
Galil AR | Hunting Blind (Factory New)|Consumer Grade|177|Galil AR|0.11|0.44|112.00
Souvenir Galil AR | Hunting Blind (Factory New)|Consumer Grade|177|Galil AR|0.11|0.44|112.00
Glock-18 | Groundwater (Factory New)|Industrial Grade|178|Glock-18|0.20|0.22|148.00
Souvenir Glock-18 | Groundwater (Factory New)|Industrial Grade|178|Glock-18|0.20|0.22|148.00
UMP-45 | Blaze (Factory New)|Mil-Spec|179|UMP-45|0.07|0.41|102.00
Souvenir UMP-45 | Blaze (Factory New)|Mil-Spec|179|UMP-45|0.07|0.41|102.00
MP7 | Orange Peel (Factory New)|Industrial Grade|180|MP7|0.06|0.58|144.00
Souvenir MP7 | Orange Peel (Factory New)|Industrial Grade|180|MP7|0.06|0.58|144.00
MP9 | Hot Rod (Factory New)|Mil-Spec|181|MP9|0.01|0.47|114.00
Souvenir MP9 | Hot Rod (Factory New)|Mil-Spec|181|MP9|0.01|0.47|114.00
Dual Berettas | Contractor (Factory New)|Consumer Grade|182|Dual Berettas|0.18|0.13|97.00
Souvenir Dual Berettas | Contractor (Factory New)|Consumer Grade|182|Dual Berettas|0.18|0.13|97.00
SCAR-20 | Contractor (Factory New)|Consumer Grade|183|SCAR-20|0.15|0.16|101.00
Souvenir SCAR-20 | Contractor (Factory New)|Consumer Grade|183|SCAR-20|0.15|0.16|101.00
G3SG1 | VariCamo (Factory New)|Industrial Grade|184|G3SG1|0.12|0.21|110.00
Souvenir G3SG1 | VariCamo (Factory New)|Industrial Grade|184|G3SG1|0.12|0.21|110.00
SSG 08 | Blue Spruce (Factory New)|Consumer Grade|185|SSG 08|0.41|0.14|114.00
Souvenir SSG 08 | Blue Spruce (Factory New)|Consumer Grade|185|SSG 08|0.41|0.14|114.00
SSG 08 | Acid Fade (Factory New)|Mil-Spec|186|SSG 08|0.21|0.21|91.00
Souvenir SSG 08 | Acid Fade (Factory New)|Mil-Spec|186|SSG 08|0.21|0.21|91.00
M249 | Gator Mesh (Factory New)|Industrial Grade|187|M249|0.17|0.44|97.00
Souvenir M249 | Gator Mesh (Factory New)|Industrial Grade|187|M249|0.17|0.44|97.00
Galil AR | VariCamo (Factory New)|Industrial Grade|188|Galil AR|0.11|0.26|135.00
Souvenir Galil AR | VariCamo (Factory New)|Industrial Grade|188|Galil AR|0.11|0.26|135.00
M4A1-S | Nitro (Factory New)|Restricted|189|M4A1-S|0.06|0.25|126.00
Souvenir M4A1-S | Nitro (Factory New)|Restricted|189|M4A1-S|0.06|0.25|126.00
Tec-9 | Army Mesh (Factory New)|Consumer Grade|190|Tec-9|0.10|0.29|93.00
Souvenir Tec-9 | Army Mesh (Factory New)|Consumer Grade|190|Tec-9|0.10|0.29|93.00
Five-SeveN | Silver Quartz (Factory New)|Mil-Spec|191|Five-SeveN|0.28|0.03|97.00
Souvenir Five-SeveN | Silver Quartz (Factory New)|Mil-Spec|191|Five-SeveN|0.28|0.03|97.00
MP7 | Army Recon (Factory New)|Consumer Grade|192|MP7|0.10|0.37|108.00
Souvenir MP7 | Army Recon (Factory New)|Consumer Grade|192|MP7|0.10|0.37|108.00
USP-S | Forest Leaves (Factory New)|Industrial Grade|193|USP-S|0.15|0.37|92.00
Souvenir USP-S | Forest Leaves (Factory New)|Industrial Grade|193|USP-S|0.15|0.37|92.00
AUG | Condemned (Factory New)|Industrial Grade|194|AUG|0.08|0.37|120.00
Souvenir AUG | Condemned (Factory New)|Industrial Grade|194|AUG|0.08|0.37|120.00
FAMAS | Teardown (Factory New)|Mil-Spec|195|FAMAS|0.74|0.29|80.00
Souvenir FAMAS | Teardown (Factory New)|Mil-Spec|195|FAMAS|0.74|0.29|80.00
MP9 | Orange Peel (Factory New)|Industrial Grade|196|MP9|0.06|0.57|137.00
Souvenir MP9 | Orange Peel (Factory New)|Industrial Grade|196|MP9|0.06|0.57|137.00
UMP-45 | Urban DDPAT (Factory New)|Consumer Grade|197|UMP-45|0.15|0.06|126.00
Souvenir UMP-45 | Urban DDPAT (Factory New)|Consumer Grade|197|UMP-45|0.15|0.06|126.00
P250 | Metallic DDPAT (Factory New)|Industrial Grade|198|P250|0.46|0.04|105.00
Souvenir P250 | Metallic DDPAT (Factory New)|Industrial Grade|198|P250|0.46|0.04|105.00
Dual Berettas | Colony (Factory New)|Consumer Grade|199|Dual Berettas|0.15|0.26|131.00
Souvenir Dual Berettas | Colony (Factory New)|Consumer Grade|199|Dual Berettas|0.15|0.26|131.00
G3SG1 | Polar Camo (Factory New)|Consumer Grade|200|G3SG1|0.15|0.06|131.00
Souvenir G3SG1 | Polar Camo (Factory New)|Consumer Grade|200|G3SG1|0.15|0.06|131.00
Desert Eagle | Urban Rubble (Factory New)|Mil-Spec|201|Desert Eagle|0.10|0.05|103.00
Souvenir Desert Eagle | Urban Rubble (Factory New)|Mil-Spec|201|Desert Eagle|0.10|0.05|103.00
Tec-9 | Red Quartz (Factory New)|Restricted|202|Tec-9|0.08|0.21|80.00
Souvenir Tec-9 | Red Quartz (Factory New)|Restricted|202|Tec-9|0.08|0.21|80.00
Five-SeveN | Forest Night (Factory New)|Consumer Grade|203|Five-SeveN|0.54|0.15|126.00
Souvenir Five-SeveN | Forest Night (Factory New)|Consumer Grade|203|Five-SeveN|0.54|0.15|126.00
MAG-7 | Metallic DDPAT (Factory New)|Industrial Grade|204|MAG-7|0.44|0.03|101.00
Souvenir MAG-7 | Metallic DDPAT (Factory New)|Industrial Grade|204|MAG-7|0.44|0.03|101.00
SCAR-20 | Carbon Fiber (Factory New)|Industrial Grade|205|SCAR-20|0.25|0.05|80.00
Souvenir SCAR-20 | Carbon Fiber (Factory New)|Industrial Grade|205|SCAR-20|0.25|0.05|80.00
Sawed-Off | Amber Fade (Factory New)|Mil-Spec|206|Sawed-Off|0.07|0.36|106.00
Souvenir Sawed-Off | Amber Fade (Factory New)|Mil-Spec|206|Sawed-Off|0.07|0.36|106.00
Nova | Polar Mesh (Factory New)|Consumer Grade|207|Nova|0.13|0.07|141.00
Souvenir Nova | Polar Mesh (Factory New)|Consumer Grade|207|Nova|0.13|0.07|141.00
P90 | Ash Wood (Factory New)|Industrial Grade|208|P90|0.14|0.12|137.00
Souvenir P90 | Ash Wood (Factory New)|Industrial Grade|208|P90|0.14|0.12|137.00
PP-Bizon | Urban Dashed (Factory New)|Consumer Grade|209|PP-Bizon|0.15|0.06|126.00
Souvenir PP-Bizon | Urban Dashed (Factory New)|Consumer Grade|209|PP-Bizon|0.15|0.06|126.00
MAC-10 | Candy Apple (Factory New)|Industrial Grade|210|MAC-10|0.01|0.35|129.00
Souvenir MAC-10 | Candy Apple (Factory New)|Industrial Grade|210|MAC-10|0.01|0.35|129.00
M4A4 | Urban DDPAT (Factory New)|Industrial Grade|211|M4A4|0.15|0.07|138.00
Souvenir M4A4 | Urban DDPAT (Factory New)|Industrial Grade|211|M4A4|0.15|0.07|138.00
Five-SeveN | Kami (Factory New)|Mil-Spec|213|Five-SeveN|0.13|0.16|134.00
M249 | Magma (Factory New)|Mil-Spec|214|M249|0.06|0.20|80.00
PP-Bizon | Cobalt Halftone (Factory New)|Mil-Spec|215|PP-Bizon|0.52|0.18|98.00
FAMAS | Pulse (Factory New)|Restricted|216|FAMAS|0.90|0.60|124.00
Dual Berettas | Marina (Factory New)|Restricted|217|Dual Berettas|0.10|0.59|120.00
MP9 | Rose Iron (Factory New)|Restricted|218|MP9|0.08|0.27|104.00
Nova | Rising Skull (Factory New)|Restricted|219|Nova|0.10|0.23|146.00
M4A1-S | Guardian (Factory New)|Classified|220|M4A1-S|0.56|0.18|95.00
P250 | Mehndi (Factory New)|Classified|221|P250|0.06|0.44|131.00
Galil AR | Blue Titanium (Factory New)|Mil-Spec|224|Galil AR|0.54|0.13|95.00
AK-47 | Blue Laminate (Factory New)|Restricted|225|AK-47|0.60|0.26|105.00
Desert Eagle | Cobalt Disruption (Factory New)|Classified|226|Desert Eagle|0.58|0.55|89.00
PP-Bizon | Water Sigil (Factory New)|Mil-Spec|227|PP-Bizon|0.61|0.20|94.00
Nova | Ghost Camo (Factory New)|Mil-Spec|228|Nova|0.89|0.07|86.00
AWP | Electric Hive (Factory New)|Classified|229|AWP|0.94|0.18|85.00
M4A4 | X-Ray (Factory New)|Covert|230|M4A4|0.73|0.05|110.00
G3SG1 | Azure Zebra (Factory New)|Mil-Spec|231|G3SG1|0.59|0.52|98.00
P250 | Steel Disruption (Factory New)|Mil-Spec|232|P250|0.55|0.13|107.00
P90 | Blind Spot (Factory New)|Restricted|233|P90|0.57|0.23|90.00
FAMAS | Afterimage (Factory New)|Classified|234|FAMAS|0.82|0.17|92.00
Five-SeveN | Nightshade (Factory New)|Mil-Spec|235|Five-SeveN|0.33|0.01|110.00
Sawed-Off | The Kraken (Factory New)|Covert|236|Sawed-Off|0.06|0.43|133.00
CZ75-Auto | Crimson Web (Factory New)|Mil-Spec|237|CZ75-Auto|0.02|0.32|104.00
P2000 | Red FragCam (Factory New)|Mil-Spec|238|P2000|0.00|0.44|100.00
Dual Berettas | Panther (Factory New)|Mil-Spec|239|Dual Berettas|0.01|0.41|124.00
USP-S | Stainless (Factory New)|Mil-Spec|240|USP-S|0.39|0.04|72.00
Glock-18 | Blue Fissure (Factory New)|Mil-Spec|241|Glock-18|0.66|0.20|103.00
CZ75-Auto | Tread Plate (Factory New)|Restricted|242|CZ75-Auto|0.21|0.04|108.00
Tec-9 | Titanium Bit (Factory New)|Restricted|243|Tec-9|0.56|0.10|80.00
Desert Eagle | Heirloom (Factory New)|Restricted|244|Desert Eagle|0.13|0.10|87.00
Five-SeveN | Copper Galaxy (Factory New)|Restricted|245|Five-SeveN|0.08|0.32|87.00
CZ75-Auto | The Fuschia Is Now (Factory New)|Classified|246|CZ75-Auto|0.93|0.17|116.00
P250 | Undertow (Factory New)|Classified|247|P250|0.54|0.49|102.00
CZ75-Auto | Victoria (Factory New)|Covert|248|CZ75-Auto|0.13|0.10|96.00
UMP-45 | Corporal (Factory New)|Mil-Spec|249|UMP-45|0.13|0.15|118.00
Negev | Terrain (Factory New)|Mil-Spec|250|Negev|0.45|0.37|95.00
MAG-7 | Heaven Guard (Factory New)|Mil-Spec|252|MAG-7|0.00|0.10|105.00
MAC-10 | Heat (Factory New)|Restricted|253|MAC-10|0.07|0.42|137.00
USP-S | Guardian (Factory New)|Restricted|256|USP-S|0.33|0.04|83.00
Nova | Antique (Factory New)|Classified|259|Nova|0.07|0.53|107.00
AUG | Chameleon (Factory New)|Covert|261|AUG|0.18|0.16|98.00
★ Gut Knife | Vanilla (Factory New)|Covert|262|Gut Knife|0.01|0.19|99.00
★ Gut Knife | Blue Steel (Factory New)|Covert|263|Gut Knife|0.01|0.25|99.00
★ Gut Knife | Boreal Forest (Factory New)|Covert|264|Gut Knife|0.19|0.18|119.00
★ Gut Knife | Case Hardened (Factory New)|Covert|265|Gut Knife|0.04|0.17|120.00
★ Gut Knife | Crimson Web (Factory New)|Covert|266|Gut Knife|0.01|0.36|119.00
★ Gut Knife | Fade (Factory New)|Covert|267|Gut Knife|0.01|0.42|141.00
★ Gut Knife | Forest DDPAT (Factory New)|Covert|268|Gut Knife|0.23|0.20|120.00
★ Gut Knife | Night (Factory New)|Covert|269|Gut Knife|0.55|0.18|100.00
★ Gut Knife | Safari Mesh (Factory New)|Covert|270|Gut Knife|0.18|0.17|120.00
★ Gut Knife | Scorched (Factory New)|Covert|271|Gut Knife|0.13|0.04|121.00
★ Gut Knife | Slaughter (Factory New)|Covert|272|Gut Knife|0.01|0.47|138.00
★ Gut Knife | Stained (Factory New)|Covert|273|Gut Knife|0.99|0.16|119.00
★ Gut Knife | Urban Masked (Factory New)|Covert|274|Gut Knife|0.44|0.04|160.00
★ Flip Knife | Vanilla (Factory New)|Covert|275|Flip Knife|0.50|0.03|104.00
★ Flip Knife | Blue Steel (Factory New)|Covert|276|Flip Knife|0.45|0.09|77.00
★ Flip Knife | Boreal Forest (Factory New)|Covert|277|Flip Knife|0.17|0.19|108.00
★ Flip Knife | Case Hardened (Factory New)|Covert|278|Flip Knife|0.17|0.19|108.00
★ Flip Knife | Crimson Web (Factory New)|Covert|279|Flip Knife|0.01|0.37|104.00
★ Flip Knife | Fade (Factory New)|Covert|280|Flip Knife|0.03|0.23|100.00
★ Flip Knife | Forest DDPAT (Factory New)|Covert|281|Flip Knife|0.20|0.20|109.00
★ Flip Knife | Night (Factory New)|Covert|282|Flip Knife|0.54|0.13|89.00
★ Flip Knife | Safari Mesh (Factory New)|Covert|283|Flip Knife|0.18|0.17|111.00
★ Flip Knife | Scorched (Factory New)|Covert|284|Flip Knife|0.10|0.05|93.00
★ Flip Knife | Slaughter (Factory New)|Covert|285|Flip Knife|0.02|0.32|111.00
★ Flip Knife | Stained (Factory New)|Covert|286|Flip Knife|0.44|0.06|94.00
★ Flip Knife | Urban Masked (Factory New)|Covert|287|Flip Knife|0.38|0.03|154.00
★ Bayonet | Vanilla (Factory New)|Covert|288|Bayonet|0.53|0.04|157.00
★ Bayonet | Blue Steel (Factory New)|Covert|289|Bayonet|0.27|0.10|106.00
★ Bayonet | Boreal Forest (Factory New)|Covert|290|Bayonet|0.21|0.22|119.00
★ Bayonet | Case Hardened (Factory New)|Covert|291|Bayonet|0.19|0.16|140.00
★ Bayonet | Crimson Web (Factory New)|Covert|292|Bayonet|0.01|0.40|116.00
★ Bayonet | Fade (Factory New)|Covert|293|Bayonet|0.07|0.27|128.00
★ Bayonet | Forest DDPAT (Factory New)|Covert|294|Bayonet|0.21|0.21|122.00
★ Bayonet | Night (Factory New)|Covert|295|Bayonet|0.56|0.16|94.00
★ Bayonet | Safari Mesh (Factory New)|Covert|296|Bayonet|0.18|0.19|122.00
★ Bayonet | Scorched (Factory New)|Covert|297|Bayonet|0.10|0.05|108.00
★ Bayonet | Slaughter (Factory New)|Covert|298|Bayonet|0.04|0.33|141.00
★ Bayonet | Stained (Factory New)|Covert|299|Bayonet|0.29|0.07|120.00
★ Bayonet | Urban Masked (Factory New)|Covert|300|Bayonet|0.40|0.03|165.00
★ M9 Bayonet | Vanilla (Factory New)|Covert|301|M9 Bayonet|0.56|0.12|112.00
★ M9 Bayonet | Blue Steel (Factory New)|Covert|302|M9 Bayonet|0.60|0.19|75.00
★ M9 Bayonet | Boreal Forest (Factory New)|Covert|303|M9 Bayonet|0.20|0.21|111.00
★ M9 Bayonet | Case Hardened (Factory New)|Covert|304|M9 Bayonet|0.13|0.17|112.00
★ M9 Bayonet | Crimson Web (Factory New)|Covert|305|M9 Bayonet|0.00|0.40|111.00
★ M9 Bayonet | Fade (Factory New)|Covert|306|M9 Bayonet|0.01|0.28|115.00
★ M9 Bayonet | Forest DDPAT (Factory New)|Covert|307|M9 Bayonet|0.22|0.21|111.00
★ M9 Bayonet | Night (Factory New)|Covert|308|M9 Bayonet|0.56|0.19|90.00
★ M9 Bayonet | Safari Mesh (Factory New)|Covert|309|M9 Bayonet|0.18|0.17|115.00
★ M9 Bayonet | Scorched (Factory New)|Covert|310|M9 Bayonet|0.08|0.05|112.00
★ M9 Bayonet | Slaughter (Factory New)|Covert|311|M9 Bayonet|0.99|0.36|121.00
★ M9 Bayonet | Stained (Factory New)|Covert|312|M9 Bayonet|0.57|0.12|113.00
★ M9 Bayonet | Urban Masked (Factory New)|Covert|313|M9 Bayonet|0.43|0.03|150.00
★ Karambit | Vanilla (Factory New)|Covert|314|Karambit|0.57|0.06|85.00
★ Karambit | Blue Steel (Factory New)|Covert|315|Karambit|0.58|0.18|117.00
★ Karambit | Boreal Forest (Factory New)|Covert|316|Karambit|0.30|0.19|115.00
★ Karambit | Case Hardened (Factory New)|Covert|317|Karambit|0.19|0.08|142.00
★ Karambit | Crimson Web (Factory New)|Covert|318|Karambit|0.01|0.27|113.00
★ Karambit | Fade (Factory New)|Covert|319|Karambit|0.90|0.20|126.00
★ Karambit | Forest DDPAT (Factory New)|Covert|320|Karambit|0.18|0.15|112.00
★ Karambit | Night (Factory New)|Covert|321|Karambit|0.54|0.04|89.00
★ Karambit | Safari Mesh (Factory New)|Covert|322|Karambit|0.19|0.15|119.00
★ Karambit | Scorched (Factory New)|Covert|323|Karambit|0.11|0.04|138.00
★ Karambit | Slaughter (Factory New)|Covert|324|Karambit|0.99|0.27|142.00
★ Karambit | Stained (Factory New)|Covert|325|Karambit|0.57|0.09|128.00
★ Karambit | Urban Masked (Factory New)|Covert|326|Karambit|0.47|0.04|154.00
Tec-9 | Isaac (Factory New)|Mil-Spec|327|Tec-9|0.01|0.34|106.00
Dual Berettas | Retribution (Factory New)|Mil-Spec|329|Dual Berettas|0.16|0.29|92.00
Galil AR | Kami (Factory New)|Mil-Spec|330|Galil AR|0.14|0.16|138.00
P90 | Desert Warfare (Factory New)|Mil-Spec|331|P90|0.14|0.28|110.00
CZ75-Auto | Poison Dart (Factory New)|Mil-Spec|332|CZ75-Auto|0.50|0.05|95.00
AUG | Torque (Factory New)|Restricted|333|AUG|0.17|0.15|117.00
PP-Bizon | Antique (Factory New)|Restricted|334|PP-Bizon|0.08|0.46|101.00
MAC-10 | Curse (Factory New)|Restricted|335|MAC-10|0.08|0.29|144.00
XM1014 | Heaven Guard (Factory New)|Restricted|336|XM1014|0.98|0.15|117.00
M4A1-S | Atomic Alloy (Factory New)|Classified|337|M4A1-S|0.05|0.53|89.00
SCAR-20 | Cyrex (Factory New)|Classified|338|SCAR-20|0.05|0.16|104.00
USP-S | Orion (Factory New)|Classified|339|USP-S|0.08|0.52|126.00
AK-47 | Vulcan (Factory New)|Covert|340|AK-47|0.48|0.06|122.00
M4A4 | Howl (Factory New)|Contraband|341|M4A4|0.04|0.54|127.00
P250 | Franklin (Factory New)|Classified|342|P250|0.18|0.12|138.00
AK-47 | Emerald Pinstripe (Factory New)|Restricted|343|AK-47|0.23|0.09|87.00
CZ75-Auto | Tuxedo (Factory New)|Mil-Spec|344|CZ75-Auto|0.13|0.13|117.00
Desert Eagle | Meteorite (Factory New)|Mil-Spec|345|Desert Eagle|0.15|0.14|73.00
G3SG1 | Green Apple (Factory New)|Industrial Grade|346|G3SG1|0.28|0.44|119.00
Galil AR | Tuxedo (Factory New)|Mil-Spec|347|Galil AR|0.15|0.11|127.00
MAC-10 | Silver (Factory New)|Industrial Grade|349|MAC-10|0.14|0.09|116.00
MP7 | Forest DDPAT (Factory New)|Consumer Grade|350|MP7|0.15|0.25|110.00
Negev | Army Sheen (Factory New)|Consumer Grade|351|Negev|0.18|0.12|85.00
Nova | Caged Steel (Factory New)|Industrial Grade|352|Nova|0.42|0.05|83.00
Sawed-Off | Forest DDPAT (Factory New)|Consumer Grade|353|Sawed-Off|0.17|0.24|99.00
SG 553 | Army Sheen (Factory New)|Consumer Grade|354|SG 553|0.19|0.08|92.00
Tec-9 | Urban DDPAT (Factory New)|Consumer Grade|355|Tec-9|0.13|0.07|126.00
UMP-45 | Carbon Fiber (Factory New)|Industrial Grade|356|UMP-45|0.20|0.05|101.00
★ Huntsman Knife | Vanilla (Factory New)|Covert|357|Huntsman Knife|0.57|0.06|83.00
★ Huntsman Knife | Blue Steel (Factory New)|Covert|358|Huntsman Knife|0.57|0.27|141.00
★ Huntsman Knife | Boreal Forest (Factory New)|Covert|359|Huntsman Knife|0.21|0.17|103.00
★ Huntsman Knife | Case Hardened (Factory New)|Covert|360|Huntsman Knife|0.61|0.04|151.00
★ Huntsman Knife | Crimson Web (Factory New)|Covert|361|Huntsman Knife|0.00|0.38|117.00
★ Huntsman Knife | Fade (Factory New)|Covert|362|Huntsman Knife|0.07|0.34|166.00
★ Huntsman Knife | Forest DDPAT (Factory New)|Covert|363|Huntsman Knife|0.20|0.16|109.00
★ Huntsman Knife | Night (Factory New)|Covert|364|Huntsman Knife|0.56|0.10|79.00
★ Huntsman Knife | Safari Mesh (Factory New)|Covert|365|Huntsman Knife|0.19|0.14|103.00
★ Huntsman Knife | Scorched (Factory New)|Covert|366|Huntsman Knife|0.10|0.03|143.00
★ Huntsman Knife | Slaughter (Factory New)|Covert|367|Huntsman Knife|0.99|0.39|155.00
★ Huntsman Knife | Stained (Factory New)|Covert|368|Huntsman Knife|0.58|0.15|157.00
★ Huntsman Knife | Urban Masked (Factory New)|Covert|369|Huntsman Knife|0.47|0.04|136.00
CZ75-Auto | Twist (Factory New)|Mil-Spec|370|CZ75-Auto|0.25|0.04|110.00
P90 | Module (Factory New)|Mil-Spec|371|P90|0.53|0.43|84.00
P2000 | Pulse (Factory New)|Mil-Spec|372|P2000|0.36|0.37|124.00
MAC-10 | Tatter (Factory New)|Restricted|373|MAC-10|0.07|0.25|121.00
USP-S | Caiman (Factory New)|Classified|374|USP-S|0.06|0.13|83.00
M4A4 | Desert-Strike (Factory New)|Covert|375|M4A4|0.11|0.28|116.00
M4A1-S | Cyrex (Factory New)|Covert|376|M4A1-S|0.02|0.28|108.00
MP7 | Urban Hazard (Factory New)|Mil-Spec|377|MP7|0.07|0.35|110.00
Negev | Desert-Strike (Factory New)|Mil-Spec|378|Negev|0.11|0.29|115.00
Nova | Koi (Factory New)|Restricted|379|Nova|0.06|0.29|135.00
P250 | Supernova (Factory New)|Restricted|380|P250|0.07|0.27|89.00
SSG 08 | Abyss (Factory New)|Mil-Spec|381|SSG 08|0.55|0.22|88.00
UMP-45 | Labyrinth (Factory New)|Mil-Spec|382|UMP-45|0.12|0.16|134.00
PP-Bizon | Osiris (Factory New)|Restricted|383|PP-Bizon|0.10|0.35|122.00
CZ75-Auto | Tigris (Factory New)|Restricted|384|CZ75-Auto|0.06|0.62|138.00
Desert Eagle | Conspiracy (Factory New)|Classified|385|Desert Eagle|0.12|0.23|88.00
Five-SeveN | Fowl Play (Factory New)|Classified|386|Five-SeveN|0.46|0.13|98.00
Glock-18 | Water Elemental (Factory New)|Classified|387|Glock-18|0.95|0.22|112.00
P2000 | Ivory (Factory New)|Mil-Spec|388|P2000|0.14|0.19|144.00
P90 | Asiimov (Factory New)|Covert|389|P90|0.07|0.26|159.00
P90 | Leather (Factory New)|Industrial Grade|390|P90|0.06|0.40|114.00
MAC-10 | Commuter (Factory New)|Industrial Grade|391|MAC-10|0.11|0.25|118.00
Sawed-Off | First Class (Factory New)|Mil-Spec|392|Sawed-Off|0.28|0.11|81.00
P2000 | Coach Class (Factory New)|Industrial Grade|393|P2000|0.09|0.40|140.00
USP-S | Business Class (Factory New)|Mil-Spec|394|USP-S|0.08|0.24|88.00
G3SG1 | Contractor (Factory New)|Consumer Grade|395|G3SG1|0.13|0.19|108.00
MP7 | Olive Plaid (Factory New)|Consumer Grade|396|MP7|0.14|0.25|128.00
CZ75-Auto | Green Plaid (Factory New)|Consumer Grade|397|CZ75-Auto|0.17|0.19|111.00
MP9 | Green Plaid (Factory New)|Consumer Grade|398|MP9|0.17|0.16|91.00
SSG 08 | Sand Dune (Factory New)|Consumer Grade|399|SSG 08|0.12|0.23|133.00
SG 553 | Traveler (Factory New)|Industrial Grade|400|SG 553|0.08|0.21|104.00
XM1014 | Red Leather (Factory New)|Mil-Spec|401|XM1014|0.02|0.35|113.00
Desert Eagle | Pilot (Factory New)|Restricted|402|Desert Eagle|0.12|0.19|97.00
AK-47 | Jet Set (Factory New)|Classified|403|AK-47|0.09|0.29|126.00
AK-47 | First Class (Factory New)|Restricted|404|AK-47|0.26|0.09|81.00
AWP | Dragon Lore (Factory New)|Covert|405|AWP|0.10|0.46|123.00
Souvenir AWP | Dragon Lore (Factory New)|Covert|405|AWP|0.10|0.46|123.00
P90 | Storm (Factory New)|Consumer Grade|406|P90|0.46|0.07|127.00
Souvenir P90 | Storm (Factory New)|Consumer Grade|406|P90|0.46|0.07|127.00
UMP-45 | Indigo (Factory New)|Consumer Grade|407|UMP-45|0.62|0.32|136.00
Souvenir UMP-45 | Indigo (Factory New)|Consumer Grade|407|UMP-45|0.62|0.32|136.00
MAC-10 | Indigo (Factory New)|Consumer Grade|408|MAC-10|0.62|0.34|134.00
Souvenir MAC-10 | Indigo (Factory New)|Consumer Grade|408|MAC-10|0.62|0.34|134.00
SCAR-20 | Storm (Factory New)|Consumer Grade|409|SCAR-20|0.52|0.07|121.00
Souvenir SCAR-20 | Storm (Factory New)|Consumer Grade|409|SCAR-20|0.52|0.07|121.00
USP-S | Royal Blue (Factory New)|Industrial Grade|410|USP-S|0.68|0.38|79.00
Souvenir USP-S | Royal Blue (Factory New)|Industrial Grade|410|USP-S|0.68|0.38|79.00
Dual Berettas | Briar (Factory New)|Consumer Grade|411|Dual Berettas|0.19|0.25|73.00
Souvenir Dual Berettas | Briar (Factory New)|Consumer Grade|411|Dual Berettas|0.19|0.25|73.00
Nova | Green Apple (Factory New)|Industrial Grade|412|Nova|0.28|0.42|128.00
Souvenir Nova | Green Apple (Factory New)|Industrial Grade|412|Nova|0.28|0.42|128.00
MAG-7 | Silver (Factory New)|Industrial Grade|413|MAG-7|0.19|0.06|118.00
Souvenir MAG-7 | Silver (Factory New)|Industrial Grade|413|MAG-7|0.19|0.06|118.00
MP9 | Dark Age (Factory New)|Mil-Spec|414|MP9|0.17|0.06|105.00
Souvenir MP9 | Dark Age (Factory New)|Mil-Spec|414|MP9|0.17|0.06|105.00
Desert Eagle | Hand Cannon (Factory New)|Restricted|415|Desert Eagle|0.42|0.24|80.00
Souvenir Desert Eagle | Hand Cannon (Factory New)|Restricted|415|Desert Eagle|0.42|0.24|80.00
P2000 | Chainmail (Factory New)|Mil-Spec|416|P2000|0.15|0.09|107.00
Souvenir P2000 | Chainmail (Factory New)|Mil-Spec|416|P2000|0.15|0.09|107.00
Sawed-Off | Rust Coat (Factory New)|Industrial Grade|417|Sawed-Off|0.05|0.26|96.00
Souvenir Sawed-Off | Rust Coat (Factory New)|Industrial Grade|417|Sawed-Off|0.05|0.26|96.00
M4A1-S | Knight (Factory New)|Classified|418|M4A1-S|0.12|0.19|85.00
Souvenir M4A1-S | Knight (Factory New)|Classified|418|M4A1-S|0.12|0.19|85.00
CZ75-Auto | Chalice (Factory New)|Restricted|419|CZ75-Auto|0.96|0.04|91.00
Souvenir CZ75-Auto | Chalice (Factory New)|Restricted|419|CZ75-Auto|0.96|0.04|91.00
M4A1-S | Master Piece (Factory New)|Classified|420|M4A1-S|0.51|0.15|100.00
Souvenir M4A1-S | Master Piece (Factory New)|Classified|420|M4A1-S|0.51|0.15|100.00
Desert Eagle | Urban DDPAT (Factory New)|Industrial Grade|421|Desert Eagle|0.12|0.09|126.00
Souvenir Desert Eagle | Urban DDPAT (Factory New)|Industrial Grade|421|Desert Eagle|0.12|0.09|126.00
MP7 | Gunsmoke (Factory New)|Industrial Grade|422|MP7|0.09|0.22|133.00
Souvenir MP7 | Gunsmoke (Factory New)|Industrial Grade|422|MP7|0.09|0.22|133.00
Glock-18 | Night (Factory New)|Industrial Grade|423|Glock-18|0.53|0.12|94.00
Souvenir Glock-18 | Night (Factory New)|Industrial Grade|423|Glock-18|0.53|0.12|94.00
P2000 | Grassland (Factory New)|Industrial Grade|424|P2000|0.11|0.31|172.00
Souvenir P2000 | Grassland (Factory New)|Industrial Grade|424|P2000|0.11|0.31|172.00
CZ75-Auto | Nitro (Factory New)|Mil-Spec|425|CZ75-Auto|0.06|0.34|146.00
Souvenir CZ75-Auto | Nitro (Factory New)|Mil-Spec|425|CZ75-Auto|0.06|0.34|146.00
Sawed-Off | Sage Spray (Factory New)|Consumer Grade|426|Sawed-Off|0.13|0.21|146.00
Souvenir Sawed-Off | Sage Spray (Factory New)|Consumer Grade|426|Sawed-Off|0.13|0.21|146.00
UMP-45 | Scorched (Factory New)|Consumer Grade|427|UMP-45|0.10|0.08|105.00
Souvenir UMP-45 | Scorched (Factory New)|Consumer Grade|427|UMP-45|0.10|0.08|105.00
M249 | Contrast Spray (Factory New)|Consumer Grade|428|M249|0.13|0.09|144.00
Souvenir M249 | Contrast Spray (Factory New)|Consumer Grade|428|M249|0.13|0.09|144.00
MAG-7 | Storm (Factory New)|Consumer Grade|429|MAG-7|0.50|0.09|140.00
Souvenir MAG-7 | Storm (Factory New)|Consumer Grade|429|MAG-7|0.50|0.09|140.00
MP9 | Storm (Factory New)|Consumer Grade|430|MP9|0.46|0.08|143.00
Souvenir MP9 | Storm (Factory New)|Consumer Grade|430|MP9|0.46|0.08|143.00
XM1014 | VariCamo Blue (Factory New)|Mil-Spec|431|XM1014|0.55|0.32|105.00
Souvenir XM1014 | VariCamo Blue (Factory New)|Mil-Spec|431|XM1014|0.55|0.32|105.00
AWP | Pink DDPAT (Factory New)|Restricted|432|AWP|0.89|0.17|90.00
Souvenir AWP | Pink DDPAT (Factory New)|Restricted|432|AWP|0.89|0.17|90.00
USP-S | Road Rash (Factory New)|Restricted|433|USP-S|0.24|0.11|148.00
Souvenir USP-S | Road Rash (Factory New)|Restricted|433|USP-S|0.24|0.11|148.00
SSG 08 | Detour (Factory New)|Mil-Spec|434|SSG 08|0.19|0.07|123.00
Souvenir SSG 08 | Detour (Factory New)|Mil-Spec|434|SSG 08|0.19|0.07|123.00
★ Butterfly Knife | Vanilla (Factory New)|Covert|435|Butterfly Knife|0.59|0.10|91.00
★ Butterfly Knife | Blue Steel (Factory New)|Covert|436|Butterfly Knife|0.57|0.23|78.00
★ Butterfly Knife | Boreal Forest (Factory New)|Covert|437|Butterfly Knife|0.33|0.20|99.00
★ Butterfly Knife | Case Hardened (Factory New)|Covert|438|Butterfly Knife|0.15|0.13|111.00
★ Butterfly Knife | Crimson Web (Factory New)|Covert|439|Butterfly Knife|0.99|0.32|94.00
★ Butterfly Knife | Fade (Factory New)|Covert|440|Butterfly Knife|0.03|0.44|117.00
★ Butterfly Knife | Forest DDPAT (Factory New)|Covert|441|Butterfly Knife|0.21|0.16|94.00
★ Butterfly Knife | Night (Factory New)|Covert|442|Butterfly Knife|0.58|0.11|75.00
★ Butterfly Knife | Safari Mesh (Factory New)|Covert|443|Butterfly Knife|0.20|0.15|98.00
★ Butterfly Knife | Scorched (Factory New)|Covert|444|Butterfly Knife|0.12|0.04|98.00
★ Butterfly Knife | Slaughter (Factory New)|Covert|445|Butterfly Knife|0.99|0.42|115.00
★ Butterfly Knife | Stained (Factory New)|Covert|446|Butterfly Knife|0.57|0.13|104.00
★ Butterfly Knife | Urban Masked (Factory New)|Covert|447|Butterfly Knife|0.52|0.06|134.00
M4A4 | Bullet Rain (Factory New)|Covert|448|M4A4|0.05|0.24|124.00
P2000 | Corticera (Factory New)|Classified|449|P2000|0.31|0.07|97.00
AWP | Corticera (Factory New)|Classified|450|AWP|0.50|0.12|85.00
AK-47 | Jaguar (Factory New)|Covert|451|AK-47|0.10|0.33|120.00
Nova | Bloomstick (Factory New)|Classified|452|Nova|0.01|0.45|122.00
AUG | Bengal Tiger (Factory New)|Classified|453|AUG|0.08|0.33|135.00
Desert Eagle | Crimson Web (Factory New)|Restricted|454|Desert Eagle|0.00|0.62|101.00
Glock-18 | Steel Disruption (Factory New)|Restricted|455|Glock-18|0.47|0.05|99.00
MP7 | Ocean Foam (Factory New)|Restricted|456|MP7|0.60|0.16|95.00
PP-Bizon | Blue Streak (Factory New)|Restricted|457|PP-Bizon|0.54|0.57|117.00
Negev | Bratatat (Factory New)|Mil-Spec|459|Negev|0.09|0.37|112.00
CZ75-Auto | Hexane (Factory New)|Mil-Spec|460|CZ75-Auto|0.58|0.20|91.00
USP-S | Blood Tiger (Factory New)|Mil-Spec|461|USP-S|0.08|0.28|81.00
MAC-10 | Ultraviolet (Factory New)|Mil-Spec|462|MAC-10|0.76|0.26|96.00
P90 | Virus (Factory New)|Restricted|464|P90|0.22|0.33|99.00
Galil AR | Cerberus (Factory New)|Restricted|465|Galil AR|0.18|0.52|110.00
Souvenir Galil AR | Cerberus (Factory New)|Restricted|465|Galil AR|0.18|0.52|110.00
Tec-9 | Toxic (Factory New)|Mil-Spec|466|Tec-9|0.13|0.44|115.00
Souvenir Tec-9 | Toxic (Factory New)|Mil-Spec|466|Tec-9|0.13|0.44|115.00
Glock-18 | Reactor (Factory New)|Mil-Spec|467|Glock-18|0.10|0.30|98.00
Souvenir Glock-18 | Reactor (Factory New)|Mil-Spec|467|Glock-18|0.10|0.30|98.00
XM1014 | Bone Machine (Factory New)|Mil-Spec|468|XM1014|0.20|0.19|91.00
Souvenir XM1014 | Bone Machine (Factory New)|Mil-Spec|468|XM1014|0.20|0.19|91.00
MAC-10 | Nuclear Garden (Factory New)|Mil-Spec|469|MAC-10|0.20|0.33|110.00
Souvenir MAC-10 | Nuclear Garden (Factory New)|Mil-Spec|469|MAC-10|0.20|0.33|110.00
AUG | Radiation Hazard (Factory New)|Industrial Grade|470|AUG|0.03|0.45|116.00
Souvenir AUG | Radiation Hazard (Factory New)|Industrial Grade|470|AUG|0.03|0.45|116.00
MP9 | Setting Sun (Factory New)|Mil-Spec|471|MP9|0.03|0.70|138.00
Souvenir MP9 | Setting Sun (Factory New)|Mil-Spec|471|MP9|0.03|0.70|138.00
PP-Bizon | Chemical Green (Factory New)|Industrial Grade|472|PP-Bizon|0.20|0.48|128.00
Souvenir PP-Bizon | Chemical Green (Factory New)|Industrial Grade|472|PP-Bizon|0.20|0.48|128.00
Negev | Nuclear Waste (Factory New)|Industrial Grade|473|Negev|0.09|0.70|128.00
Souvenir Negev | Nuclear Waste (Factory New)|Industrial Grade|473|Negev|0.09|0.70|128.00
FAMAS | Styx (Factory New)|Restricted|474|FAMAS|0.03|0.37|86.00
Souvenir FAMAS | Styx (Factory New)|Restricted|474|FAMAS|0.03|0.37|86.00
P250 | Contamination (Factory New)|Industrial Grade|475|P250|0.12|0.28|138.00
Souvenir P250 | Contamination (Factory New)|Industrial Grade|475|P250|0.12|0.28|138.00
Five-SeveN | Hot Shot (Factory New)|Industrial Grade|476|Five-SeveN|0.20|0.40|163.00
Souvenir Five-SeveN | Hot Shot (Factory New)|Industrial Grade|476|Five-SeveN|0.20|0.40|163.00
SG 553 | Fallout Warning (Factory New)|Industrial Grade|477|SG 553|0.03|0.36|83.00
Souvenir SG 553 | Fallout Warning (Factory New)|Industrial Grade|477|SG 553|0.03|0.36|83.00
AK-47 | Wasteland Rebel (Factory New)|Covert|478|AK-47|0.10|0.21|108.00
Five-SeveN | Urban Hazard (Factory New)|Mil-Spec|479|Five-SeveN|0.02|0.41|135.00
G3SG1 | Murky (Factory New)|Mil-Spec|480|G3SG1|0.28|0.04|82.00
Glock-18 | Grinder (Factory New)|Restricted|481|Glock-18|0.22|0.03|97.00
M4A1-S | Basilisk (Factory New)|Restricted|482|M4A1-S|0.25|0.02|85.00
M4A4 | Griffin (Factory New)|Restricted|483|M4A4|0.09|0.25|105.00
MAG-7 | Firestarter (Factory New)|Mil-Spec|484|MAG-7|0.10|0.17|150.00
MP9 | Dart (Factory New)|Mil-Spec|485|MP9|0.12|0.07|101.00
P250 | Cartel (Factory New)|Classified|486|P250|0.43|0.05|98.00
P2000 | Fire Elemental (Factory New)|Covert|487|P2000|0.67|0.25|122.00
Sawed-Off | Highwayman (Factory New)|Restricted|488|Sawed-Off|0.07|0.34|90.00
SCAR-20 | Cardiac (Factory New)|Classified|489|SCAR-20|0.75|0.12|86.00
UMP-45 | Delusion (Factory New)|Mil-Spec|490|UMP-45|0.17|0.50|145.00
XM1014 | Tranquility (Factory New)|Classified|491|XM1014|0.02|0.50|151.00
AK-47 | Cartel (Factory New)|Classified|492|AK-47|0.04|0.29|96.00
Desert Eagle | Naga (Factory New)|Restricted|494|Desert Eagle|0.15|0.11|91.00
Glock-18 | Catacombs (Factory New)|Mil-Spec|496|Glock-18|0.17|0.04|105.00
M249 | System Lock (Factory New)|Mil-Spec|497|M249|0.01|0.54|132.00
XM1014 | Quicksilver (Factory New)|Mil-Spec|498|XM1014|0.46|0.04|92.00
MAC-10 | Malachite (Factory New)|Restricted|499|MAC-10|0.43|0.27|123.00
MP9 | Deadly Poison (Factory New)|Mil-Spec|500|MP9|0.21|0.31|106.00
P250 | Muertos (Factory New)|Classified|501|P250|0.00|0.61|134.00
M4A4 | 龍王 (Dragon King) (Factory New)|Classified|502|M4A4|0.87|0.20|124.00
Sawed-Off | Serenity (Factory New)|Restricted|503|Sawed-Off|0.49|0.34|137.00
SCAR-20 | Grotto (Factory New)|Mil-Spec|504|SCAR-20|0.53|0.32|71.00
Dual Berettas | Urban Shock (Factory New)|Restricted|505|Dual Berettas|0.57|0.40|127.00
★ Gut Knife | Damascus Steel (Factory New)|Covert|506|Gut Knife|0.01|0.19|128.00
★ Gut Knife | Marble Fade (Factory New)|Covert|508|Gut Knife|0.93|0.31|99.00
★ Gut Knife | Tiger Tooth (Factory New)|Covert|509|Gut Knife|0.07|0.62|140.00
★ Gut Knife | Ultraviolet (Factory New)|Covert|511|Gut Knife|0.74|0.32|118.00
★ Flip Knife | Damascus Steel (Factory New)|Covert|512|Flip Knife|0.43|0.07|107.00
★ Flip Knife | Marble Fade (Factory New)|Covert|514|Flip Knife|0.09|0.31|87.00
★ Flip Knife | Tiger Tooth (Factory New)|Covert|515|Flip Knife|0.10|0.50|125.00
★ Flip Knife | Ultraviolet (Factory New)|Covert|517|Flip Knife|0.74|0.30|94.00
★ Bayonet | Damascus Steel (Factory New)|Covert|518|Bayonet|0.30|0.07|136.00
★ Bayonet | Marble Fade (Factory New)|Covert|520|Bayonet|0.11|0.26|103.00
★ Bayonet | Tiger Tooth (Factory New)|Covert|521|Bayonet|0.11|0.47|150.00
★ Bayonet | Ultraviolet (Factory New)|Covert|523|Bayonet|0.75|0.35|103.00
★ M9 Bayonet | Damascus Steel (Factory New)|Covert|524|M9 Bayonet|0.55|0.10|131.00
★ M9 Bayonet | Marble Fade (Factory New)|Covert|526|M9 Bayonet|0.03|0.29|86.00
★ M9 Bayonet | Tiger Tooth (Factory New)|Covert|527|M9 Bayonet|0.10|0.59|123.00
★ M9 Bayonet | Ultraviolet (Factory New)|Covert|529|M9 Bayonet|0.75|0.35|108.00
★ Karambit | Damascus Steel (Factory New)|Covert|530|Karambit|0.55|0.08|139.00
★ Karambit | Marble Fade (Factory New)|Covert|532|Karambit|0.64|0.18|130.00
★ Karambit | Tiger Tooth (Factory New)|Covert|533|Karambit|0.11|0.42|135.00
★ Karambit | Ultraviolet (Factory New)|Covert|535|Karambit|0.71|0.11|96.00
MAC-10 | Neon Rider (Factory New)|Covert|536|MAC-10|0.89|0.14|133.00
M4A1-S | Hyper Beast (Factory New)|Covert|537|M4A1-S|0.66|0.17|96.00
FAMAS | Djinn (Factory New)|Classified|538|FAMAS|0.19|0.07|81.00
CZ75-Auto | Pole Position (Factory New)|Restricted|542|CZ75-Auto|0.00|0.12|136.00
MAG-7 | Heat (Factory New)|Restricted|543|MAG-7|0.05|0.68|150.00
AWP | Worm God (Factory New)|Restricted|544|AWP|0.17|0.08|96.00
Sawed-Off | Origami (Factory New)|Mil-Spec|545|Sawed-Off|0.08|0.65|141.00
P250 | Valence (Factory New)|Mil-Spec|547|P250|0.54|0.21|90.00
Desert Eagle | Bronze Deco (Factory New)|Mil-Spec|548|Desert Eagle|0.11|0.25|88.00
MP7 | Armor Core (Factory New)|Mil-Spec|549|MP7|0.21|0.04|94.00
AK-47 | Elite Build (Factory New)|Mil-Spec|550|AK-47|0.10|0.19|78.00
AWP | Hyper Beast (Factory New)|Covert|551|AWP|0.90|0.11|89.00
AK-47 | Aquamarine Revenge (Factory New)|Covert|552|AK-47|0.16|0.15|106.00
SG 553 | Cyrex (Factory New)|Classified|553|SG 553|0.03|0.27|108.00
MP7 | Nemesis (Factory New)|Classified|554|MP7|0.12|0.36|108.00
CZ75-Auto | Yellow Jacket (Factory New)|Classified|555|CZ75-Auto|0.12|0.55|138.00
P2000 | Handgun (Factory New)|Restricted|556|P2000|0.51|0.32|108.00
MP9 | Ruby Poison Dart (Factory New)|Restricted|558|MP9|1.00|0.40|106.00
M4A4 | Evil Daimyo (Factory New)|Restricted|559|M4A4|0.01|0.49|125.00
FAMAS | Neural Net (Factory New)|Restricted|560|FAMAS|0.13|0.48|107.00
USP-S | Torque (Factory New)|Mil-Spec|561|USP-S|0.15|0.22|124.00
UMP-45 | Riot (Factory New)|Mil-Spec|562|UMP-45|0.18|0.21|111.00
P90 | Elite Build (Factory New)|Mil-Spec|563|P90|0.10|0.14|101.00
Nova | Ranger (Factory New)|Mil-Spec|564|Nova|0.19|0.23|92.00
Glock-18 | Bunsen Burner (Factory New)|Mil-Spec|565|Glock-18|0.52|0.24|90.00
Galil AR | Rocket Pop (Factory New)|Mil-Spec|566|Galil AR|0.59|0.32|145.00
SCAR-20 | Army Sheen (Factory New)|Consumer Grade|567|SCAR-20|0.19|0.09|74.00
CZ75-Auto | Army Sheen (Factory New)|Consumer Grade|568|CZ75-Auto|0.23|0.08|95.00
M249 | Impact Drill (Factory New)|Consumer Grade|569|M249|0.12|0.51|124.00
MAG-7 | Seabird (Factory New)|Consumer Grade|570|MAG-7|0.45|0.21|148.00
Desert Eagle | Night (Factory New)|Industrial Grade|571|Desert Eagle|0.46|0.06|70.00
Galil AR | Urban Rubble (Factory New)|Industrial Grade|572|Galil AR|0.17|0.01|109.00
USP-S | Para Green (Factory New)|Industrial Grade|573|USP-S|0.25|0.28|142.00
MAC-10 | Fade (Factory New)|Mil-Spec|574|MAC-10|0.02|0.19|98.00
P250 | Whiteout (Factory New)|Mil-Spec|575|P250|0.15|0.08|160.00
MP7 | Full Stop (Factory New)|Mil-Spec|576|MP7|0.03|0.51|101.00
Five-SeveN | Nitro (Factory New)|Mil-Spec|577|Five-SeveN|0.05|0.43|150.00
CZ75-Auto | Emerald (Factory New)|Mil-Spec|578|CZ75-Auto|0.39|0.27|103.00
SG 553 | Bulldozer (Factory New)|Restricted|579|SG 553|0.14|0.31|125.00
Dual Berettas | Duelist (Factory New)|Restricted|580|Dual Berettas|0.71|0.08|91.00
Glock-18 | Twilight Galaxy (Factory New)|Classified|581|Glock-18|0.56|0.26|90.00
M4A1-S | Hot Rod (Factory New)|Classified|582|M4A1-S|0.00|0.41|92.00
MP7 | Asterion (Factory New)|Consumer Grade|583|MP7|0.59|0.68|130.00
AUG | Daedalus (Factory New)|Consumer Grade|584|AUG|0.04|0.18|96.00
Dual Berettas | Moon in Libra (Factory New)|Consumer Grade|585|Dual Berettas|0.64|0.40|82.00
Nova | Moon in Libra (Factory New)|Consumer Grade|586|Nova|0.64|0.42|93.00
Tec-9 | Hades (Factory New)|Industrial Grade|587|Tec-9|0.14|0.13|151.00
P2000 | Pathfinder (Factory New)|Industrial Grade|588|P2000|0.15|0.07|112.00
AWP | Sun in Leo (Factory New)|Industrial Grade|589|AWP|0.66|0.41|110.00
M249 | Shipping Forecast (Factory New)|Industrial Grade|590|M249|0.51|0.35|78.00
UMP-45 | Minotaur's Labyrinth (Factory New)|Mil-Spec|591|UMP-45|0.70|0.23|99.00
MP9 | Pandora's Box (Factory New)|Mil-Spec|592|MP9|0.60|0.35|101.00
G3SG1 | Chronos (Factory New)|Restricted|593|G3SG1|0.63|0.15|94.00
M4A1-S | Icarus Fell (Factory New)|Restricted|594|M4A1-S|0.54|0.63|119.00
M4A4 | Poseidon (Factory New)|Classified|595|M4A4|0.49|0.33|96.00
AWP | Medusa (Factory New)|Covert|596|AWP|0.55|0.10|70.00
PP-Bizon | Bamboo Print (Factory New)|Consumer Grade|597|PP-Bizon|0.13|0.18|150.00
Sawed-Off | Bamboo Shadow (Factory New)|Consumer Grade|598|Sawed-Off|0.11|0.08|71.00
Tec-9 | Bamboo Forest (Factory New)|Consumer Grade|599|Tec-9|0.18|0.27|143.00
G3SG1 | Orange Kimono (Factory New)|Consumer Grade|600|G3SG1|0.10|0.41|114.00
P250 | Mint Kimono (Factory New)|Consumer Grade|601|P250|0.40|0.08|143.00
P250 | Crimson Kimono (Factory New)|Industrial Grade|602|P250|0.01|0.22|103.00
Desert Eagle | Midnight Storm (Factory New)|Industrial Grade|603|Desert Eagle|0.51|0.34|86.00
Galil AR | Aqua Terrace (Factory New)|Mil-Spec|604|Galil AR|0.47|0.31|124.00
MAG-7 | Counter Terrace (Factory New)|Mil-Spec|605|MAG-7|0.21|0.37|140.00
Tec-9 | Terrace (Factory New)|Mil-Spec|606|Tec-9|0.12|0.45|154.00
Five-SeveN | Neon Kimono (Factory New)|Restricted|607|Five-SeveN|0.18|0.38|166.00
Desert Eagle | Sunset Storm 壱 (Factory New)|Restricted|608|Desert Eagle|0.02|0.61|98.00
Desert Eagle | Sunset Storm 弐 (Factory New)|Restricted|609|Desert Eagle|0.02|0.61|98.00
M4A4 | Daybreak (Factory New)|Restricted|610|M4A4|0.11|0.28|109.00
AK-47 | Hydroponic (Factory New)|Classified|611|AK-47|0.13|0.39|105.00
AUG | Akihabara Accept (Factory New)|Covert|612|AUG|0.74|0.17|129.00
★ Falchion Knife | Vanilla (Factory New)|Covert|613|Falchion Knife|0.56|0.09|93.00
★ Falchion Knife | Blue Steel (Factory New)|Covert|614|Falchion Knife|0.59|0.20|76.00
★ Falchion Knife | Boreal Forest (Factory New)|Covert|615|Falchion Knife|0.24|0.22|120.00
★ Falchion Knife | Case Hardened (Factory New)|Covert|616|Falchion Knife|0.13|0.17|127.00
★ Falchion Knife | Crimson Web (Factory New)|Covert|617|Falchion Knife|0.01|0.46|128.00
★ Falchion Knife | Fade (Factory New)|Covert|618|Falchion Knife|0.02|0.32|122.00
★ Falchion Knife | Forest DDPAT (Factory New)|Covert|619|Falchion Knife|0.17|0.18|123.00
★ Falchion Knife | Night (Factory New)|Covert|620|Falchion Knife|0.57|0.08|93.00
★ Falchion Knife | Safari Mesh (Factory New)|Covert|621|Falchion Knife|0.18|0.17|120.00
★ Falchion Knife | Scorched (Factory New)|Covert|622|Falchion Knife|0.10|0.07|110.00
★ Falchion Knife | Slaughter (Factory New)|Covert|623|Falchion Knife|0.99|0.44|137.00
★ Falchion Knife | Stained (Factory New)|Covert|624|Falchion Knife|0.57|0.12|112.00
★ Falchion Knife | Urban Masked (Factory New)|Covert|625|Falchion Knife|0.33|0.02|173.00
Dual Berettas | Dualing Dragons (Factory New)|Mil-Spec|626|Dual Berettas|0.05|0.38|94.00
FAMAS | Survivor Z (Factory New)|Mil-Spec|627|FAMAS|0.03|0.37|123.00
Glock-18 | Wraiths (Factory New)|Mil-Spec|628|Glock-18|0.12|0.11|91.00
MAC-10 | Rangeen (Factory New)|Mil-Spec|629|MAC-10|0.08|0.25|151.00
MAG-7 | Cobalt Core (Factory New)|Mil-Spec|630|MAG-7|0.53|0.49|115.00
SCAR-20 | Green Marine (Factory New)|Mil-Spec|631|SCAR-20|0.19|0.16|73.00
XM1014 | Scumbria (Factory New)|Mil-Spec|632|XM1014|0.50|0.05|96.00
Galil AR | Stone Cold (Factory New)|Restricted|633|Galil AR|0.56|0.44|95.00
M249 | Nebula Crusader (Factory New)|Restricted|634|M249|0.07|0.18|92.00
MP7 | Special Delivery (Factory New)|Restricted|635|MP7|0.10|0.19|130.00
P250 | Wingshot (Factory New)|Restricted|636|P250|0.16|0.41|139.00
AK-47 | Frontside Misty (Factory New)|Classified|637|AK-47|0.49|0.31|128.00
G3SG1 | Flux (Factory New)|Classified|638|G3SG1|0.71|0.21|70.00
SSG 08 | Big Iron (Factory New)|Classified|639|SSG 08|0.10|0.43|105.00
M4A1-S | Golden Coil (Factory New)|Covert|640|M4A1-S|0.10|0.64|140.00
USP-S | Kill Confirmed (Factory New)|Covert|641|USP-S|0.05|0.38|130.00
★ Shadow Daggers | Vanilla (Factory New)|Covert|642|Shadow Daggers|0.53|0.08|75.00
★ Shadow Daggers | Blue Steel (Factory New)|Covert|643|Shadow Daggers|0.59|0.24|147.00
★ Shadow Daggers | Boreal Forest (Factory New)|Covert|644|Shadow Daggers|0.19|0.15|111.00
★ Shadow Daggers | Case Hardened (Factory New)|Covert|645|Shadow Daggers|0.33|0.03|156.00
★ Shadow Daggers | Crimson Web (Factory New)|Covert|646|Shadow Daggers|0.01|0.28|116.00
★ Shadow Daggers | Fade (Factory New)|Covert|647|Shadow Daggers|0.96|0.45|180.00
★ Shadow Daggers | Forest DDPAT (Factory New)|Covert|648|Shadow Daggers|0.21|0.17|112.00
★ Shadow Daggers | Night (Factory New)|Covert|649|Shadow Daggers|0.55|0.07|98.00
★ Shadow Daggers | Safari Mesh (Factory New)|Covert|650|Shadow Daggers|0.17|0.12|107.00
★ Shadow Daggers | Scorched (Factory New)|Covert|651|Shadow Daggers|0.11|0.04|169.00
★ Shadow Daggers | Slaughter (Factory New)|Covert|652|Shadow Daggers|0.99|0.43|171.00
★ Shadow Daggers | Stained (Factory New)|Covert|653|Shadow Daggers|0.58|0.12|162.00
★ Shadow Daggers | Urban Masked (Factory New)|Covert|654|Shadow Daggers|0.42|0.03|148.00
R8 Revolver | Fade (Factory New)|Covert|655|R8 Revolver|0.06|0.36|98.00
M4A4 | Royal Paladin (Factory New)|Covert|656|M4A4|0.12|0.14|101.00
R8 Revolver | Crimson Web (Factory New)|Mil-Spec|657|R8 Revolver|0.01|0.50|115.00
AUG | Ricochet (Factory New)|Mil-Spec|658|AUG|0.46|0.19|115.00
Desert Eagle | Corinthian (Factory New)|Mil-Spec|659|Desert Eagle|0.07|0.31|86.00
P2000 | Imperial (Factory New)|Mil-Spec|660|P2000|0.02|0.42|103.00
Sawed-Off | Yorick (Factory New)|Mil-Spec|661|Sawed-Off|0.08|0.38|91.00
SCAR-20 | Outbreak (Factory New)|Mil-Spec|662|SCAR-20|0.21|0.30|114.00
PP-Bizon | Fuel Rod (Factory New)|Restricted|663|PP-Bizon|0.28|0.37|90.00
Negev | Power Loader (Factory New)|Restricted|664|Negev|0.18|0.41|123.00
Five-SeveN | Retrobution (Factory New)|Restricted|665|Five-SeveN|0.07|0.33|164.00
SG 553 | Tiger Moth (Factory New)|Restricted|666|SG 553|0.06|0.46|113.00
Tec-9 | Avalanche (Factory New)|Restricted|667|Tec-9|0.46|0.15|130.00
XM1014 | Teclu Burner (Factory New)|Restricted|668|XM1014|0.12|0.32|98.00
AK-47 | Point Disarray (Factory New)|Classified|669|AK-47|0.83|0.05|110.00
P90 | Shapewood (Factory New)|Classified|670|P90|0.10|0.43|162.00
R8 Revolver | Amber Fade (Factory New)|Classified|672|R8 Revolver|0.13|0.20|86.00
Souvenir R8 Revolver | Amber Fade (Factory New)|Classified|672|R8 Revolver|0.13|0.20|86.00
R8 Revolver | Bone Mask (Factory New)|Consumer Grade|673|R8 Revolver|0.14|0.19|120.00
Souvenir R8 Revolver | Bone Mask (Factory New)|Consumer Grade|673|R8 Revolver|0.14|0.19|120.00
PP-Bizon | Photic Zone (Factory New)|Mil-Spec|674|PP-Bizon|0.36|0.25|110.00
Dual Berettas | Cartel (Factory New)|Mil-Spec|675|Dual Berettas|0.10|0.26|112.00
MAC-10 | Lapis Gator (Factory New)|Mil-Spec|676|MAC-10|0.59|0.10|109.00
SSG 08 | Necropos (Factory New)|Mil-Spec|677|SSG 08|0.15|0.22|96.00
Tec-9 | Jambiya (Factory New)|Mil-Spec|678|Tec-9|0.12|0.14|117.00
USP-S | Lead Conduit (Factory New)|Mil-Spec|679|USP-S|0.11|0.18|90.00
FAMAS | Valence (Factory New)|Restricted|680|FAMAS|0.04|0.33|94.00
Five-SeveN | Triumvirate (Factory New)|Restricted|681|Five-SeveN|0.14|0.15|130.00
Glock-18 | Royal Legion (Factory New)|Restricted|682|Glock-18|0.04|0.52|124.00
MAG-7 | Praetorian (Factory New)|Restricted|683|MAG-7|0.06|0.04|68.00
MP7 | Impire (Factory New)|Restricted|684|MP7|0.20|0.42|137.00
AWP | Elite Build (Factory New)|Classified|685|AWP|0.09|0.15|71.00
Desert Eagle | Kumicho Dragon (Factory New)|Classified|686|Desert Eagle|0.50|0.07|102.00
Nova | Hyper Beast (Factory New)|Classified|687|Nova|0.94|0.09|98.00
AK-47 | Fuel Injector (Factory New)|Covert|688|AK-47|0.11|0.38|101.00
M4A4 | The Battlestar (Factory New)|Covert|689|M4A4|0.14|0.21|95.00
★ Bowie Knife | Vanilla (Factory New)|Covert|690|Bowie Knife|0.38|0.04|89.00
★ Bowie Knife | Blue Steel (Factory New)|Covert|691|Bowie Knife|0.59|0.24|89.00
★ Bowie Knife | Boreal Forest (Factory New)|Covert|692|Bowie Knife|0.26|0.21|115.00
★ Bowie Knife | Case Hardened (Factory New)|Covert|693|Bowie Knife|0.25|0.03|126.00
★ Bowie Knife | Crimson Web (Factory New)|Covert|694|Bowie Knife|0.00|0.36|116.00
★ Bowie Knife | Fade (Factory New)|Covert|695|Bowie Knife|0.98|0.40|131.00
★ Bowie Knife | Forest DDPAT (Factory New)|Covert|696|Bowie Knife|0.20|0.19|116.00
★ Bowie Knife | Night (Factory New)|Covert|697|Bowie Knife|0.57|0.13|89.00
★ Bowie Knife | Safari Mesh (Factory New)|Covert|698|Bowie Knife|0.17|0.18|114.00
★ Bowie Knife | Scorched (Factory New)|Covert|699|Bowie Knife|0.08|0.05|120.00
★ Bowie Knife | Slaughter (Factory New)|Covert|700|Bowie Knife|0.99|0.45|140.00
★ Bowie Knife | Stained (Factory New)|Covert|701|Bowie Knife|0.58|0.12|121.00
★ Bowie Knife | Urban Masked (Factory New)|Covert|702|Bowie Knife|0.43|0.03|157.00
AUG | Fleet Flock (Factory New)|Classified|703|AUG|0.21|0.16|130.00
PP-Bizon | Judgement of Anubis (Factory New)|Covert|704|PP-Bizon|0.11|0.40|102.00
CZ75-Auto | Red Astor (Factory New)|Restricted|705|CZ75-Auto|0.03|0.24|96.00
Dual Berettas | Ventilators (Factory New)|Mil-Spec|706|Dual Berettas|0.17|0.09|97.00
G3SG1 | Orange Crash (Factory New)|Mil-Spec|707|G3SG1|0.07|0.53|125.00
Galil AR | Firefight (Factory New)|Restricted|708|Galil AR|0.03|0.36|122.00
M249 | Spectre (Factory New)|Mil-Spec|709|M249|0.11|0.20|132.00
M4A1-S | Chantico's Fire (Factory New)|Covert|710|M4A1-S|0.08|0.53|139.00
MP9 | Bioleak (Factory New)|Mil-Spec|711|MP9|0.16|0.42|81.00
P2000 | Oceanic (Factory New)|Mil-Spec|712|P2000|0.57|0.57|126.00
SG 553 | Atlas (Factory New)|Mil-Spec|715|SG 553|0.19|0.21|82.00
SSG 08 | Ghost Crusader (Factory New)|Restricted|716|SSG 08|0.52|0.10|115.00
Tec-9 | Re-Entry (Factory New)|Restricted|717|Tec-9|0.02|0.24|87.00
UMP-45 | Primal Saber (Factory New)|Classified|718|UMP-45|0.44|0.15|133.00
XM1014 | Black Tie (Factory New)|Restricted|719|XM1014|0.15|0.07|109.00
M4A1-S | Mecha Industries (Factory New)|Covert|720|M4A1-S|0.12|0.16|139.00
Glock-18 | Wasteland Rebel (Factory New)|Covert|721|Glock-18|0.10|0.13|126.00
SCAR-20 | Bloodsport (Factory New)|Classified|722|SCAR-20|0.07|0.35|116.00
P2000 | Imperial Dragon (Factory New)|Classified|723|P2000|0.05|0.61|116.00
M4A4 | Desolate Space (Factory New)|Classified|724|M4A4|0.66|0.14|126.00
Sawed-Off | Limelight (Factory New)|Restricted|725|Sawed-Off|0.19|0.30|125.00
R8 Revolver | Reboot (Factory New)|Restricted|726|R8 Revolver|0.08|0.11|106.00
P90 | Chopper (Factory New)|Restricted|727|P90|0.06|0.27|86.00
AWP | Phobos (Factory New)|Restricted|728|AWP|0.13|0.27|79.00
AUG | Aristocrat (Factory New)|Restricted|729|AUG|0.53|0.05|101.00
Tec-9 | Ice Cap (Factory New)|Mil-Spec|730|Tec-9|0.59|0.22|88.00
SG 553 | Aerial (Factory New)|Mil-Spec|731|SG 553|0.12|0.24|113.00
PP-Bizon | Harvester (Factory New)|Mil-Spec|732|PP-Bizon|0.19|0.10|79.00
P250 | Iron Clad (Factory New)|Mil-Spec|733|P250|0.23|0.21|101.00
Nova | Exo (Factory New)|Mil-Spec|734|Nova|0.25|0.02|84.00
MAC-10 | Carnivore (Factory New)|Mil-Spec|735|MAC-10|0.06|0.28|127.00
Five-SeveN | Violent Daimyo (Factory New)|Mil-Spec|736|Five-SeveN|0.83|0.30|97.00
★ Bayonet | Lore (Factory New)|Covert|737|Bayonet|0.13|0.49|159.00
★ Flip Knife | Lore (Factory New)|Covert|738|Flip Knife|0.12|0.48|136.00
★ Gut Knife | Lore (Factory New)|Covert|739|Gut Knife|0.14|0.51|142.00
★ Karambit | Lore (Factory New)|Covert|740|Karambit|0.13|0.49|144.00
★ M9 Bayonet | Lore (Factory New)|Covert|741|M9 Bayonet|0.13|0.51|138.00
★ Bayonet | Black Laminate (Factory New)|Covert|742|Bayonet|0.17|0.05|129.00
★ Flip Knife | Black Laminate (Factory New)|Covert|743|Flip Knife|0.13|0.09|106.00
★ Gut Knife | Black Laminate (Factory New)|Covert|744|Gut Knife|0.17|0.05|128.00
★ Karambit | Black Laminate (Factory New)|Covert|745|Karambit|0.21|0.05|136.00
★ M9 Bayonet | Black Laminate (Factory New)|Covert|746|M9 Bayonet|0.23|0.04|131.00
★ Bayonet | Autotronic (Factory New)|Covert|752|Bayonet|0.00|0.18|130.00
★ Flip Knife | Autotronic (Factory New)|Covert|753|Flip Knife|0.04|0.11|108.00
★ Gut Knife | Autotronic (Factory New)|Covert|754|Gut Knife|0.05|0.06|125.00
★ Karambit | Autotronic (Factory New)|Covert|755|Karambit|0.99|0.20|119.00
★ M9 Bayonet | Autotronic (Factory New)|Covert|756|M9 Bayonet|0.98|0.05|129.00
★ Bayonet | Bright Water (Factory New)|Covert|757|Bayonet|0.60|0.39|140.00
★ Flip Knife | Bright Water (Factory New)|Covert|758|Flip Knife|0.60|0.38|126.00
★ Gut Knife | Bright Water (Factory New)|Covert|759|Gut Knife|0.60|0.40|142.00
★ Karambit | Bright Water (Factory New)|Covert|760|Karambit|0.59|0.31|121.00
★ M9 Bayonet | Bright Water (Factory New)|Covert|761|M9 Bayonet|0.60|0.41|133.00
★ Bayonet | Freehand (Factory New)|Covert|762|Bayonet|0.11|0.02|142.00
★ Flip Knife | Freehand (Factory New)|Covert|763|Flip Knife|0.33|0.01|112.00
★ Gut Knife | Freehand (Factory New)|Covert|764|Gut Knife|0.96|0.21|123.00
★ Karambit | Freehand (Factory New)|Covert|765|Karambit|0.67|0.08|130.00
★ M9 Bayonet | Freehand (Factory New)|Covert|766|M9 Bayonet|0.70|0.15|123.00
AK-47 | Neon Revolution (Factory New)|Covert|767|AK-47|0.96|0.38|113.00
AUG | Syd Mead (Factory New)|Classified|768|AUG|0.04|0.18|103.00
CZ75-Auto | Imprint (Factory New)|Mil-Spec|769|CZ75-Auto|0.15|0.09|136.00
Desert Eagle | Directive (Factory New)|Restricted|770|Desert Eagle|0.54|0.13|67.00
FAMAS | Roll Cage (Factory New)|Covert|771|FAMAS|0.04|0.33|104.00
Five-SeveN | Scumbria (Factory New)|Mil-Spec|772|Five-SeveN|0.44|0.03|93.00
G3SG1 | Ventilator (Factory New)|Mil-Spec|773|G3SG1|0.23|0.06|80.00
Glock-18 | Weasel (Factory New)|Restricted|774|Glock-18|0.07|0.31|125.00
MAG-7 | Petroglyph (Factory New)|Restricted|775|MAG-7|0.07|0.23|107.00
MP9 | Airlock (Factory New)|Classified|776|MP9|0.08|0.24|140.00
P90 | Grim (Factory New)|Mil-Spec|778|P90|0.33|0.23|117.00
SCAR-20 | Powercore (Factory New)|Restricted|779|SCAR-20|0.16|0.35|80.00
SG 553 | Triarch (Factory New)|Restricted|780|SG 553|0.10|0.31|120.00
Tec-9 | Fuel Injector (Factory New)|Classified|781|Tec-9|0.12|0.47|131.00
UMP-45 | Briefing (Factory New)|Mil-Spec|782|UMP-45|0.02|0.07|106.00
XM1014 | Slipstream (Factory New)|Mil-Spec|783|XM1014|0.51|0.32|114.00
CZ75-Auto | Polymer (Factory New)|Mil-Spec|784|CZ75-Auto|0.44|0.15|101.00
Glock-18 | Ironwork (Factory New)|Mil-Spec|785|Glock-18|0.14|0.06|101.00
MP7 | Cirrus (Factory New)|Mil-Spec|786|MP7|0.56|0.49|99.00
Galil AR | Black Sand (Factory New)|Mil-Spec|787|Galil AR|0.11|0.26|107.00
MP9 | Sand Scale (Factory New)|Mil-Spec|788|MP9|0.13|0.16|114.00
MAG-7 | Sonar (Factory New)|Mil-Spec|789|MAG-7|0.38|0.08|88.00
P2000 | Turf (Factory New)|Mil-Spec|790|P2000|0.21|0.24|120.00
Dual Berettas | Royal Consorts (Factory New)|Restricted|791|Dual Berettas|0.18|0.21|82.00
G3SG1 | Stinger (Factory New)|Restricted|792|G3SG1|0.15|0.28|105.00
M4A1-S | Flashback (Factory New)|Restricted|793|M4A1-S|0.13|0.25|105.00
Nova | Gila (Factory New)|Restricted|794|Nova|0.11|0.11|79.00
USP-S | Cyrex (Factory New)|Restricted|795|USP-S|0.04|0.20|114.00
FAMAS | Mecha Industries (Factory New)|Classified|796|FAMAS|0.10|0.19|144.00
P90 | Shallow Grave (Factory New)|Classified|797|P90|0.93|0.08|60.00
Sawed-Off | Wasteland Princess (Factory New)|Classified|798|Sawed-Off|0.99|0.20|145.00
SSG 08 | Dragonfire (Factory New)|Covert|799|SSG 08|0.06|0.45|105.00
M4A4 | Buzz Kill (Factory New)|Covert|800|M4A4|0.12|0.44|106.00
PP-Bizon | Jungle Slipstream (Factory New)|Mil-Spec|801|PP-Bizon|0.18|0.32|103.00
SCAR-20 | Blueprint (Factory New)|Mil-Spec|802|SCAR-20|0.60|0.47|96.00
Desert Eagle | Oxide Blaze (Factory New)|Mil-Spec|803|Desert Eagle|0.09|0.17|109.00
Five-SeveN | Capillary (Factory New)|Mil-Spec|804|Five-SeveN|0.10|0.10|105.00
MP7 | Akoben (Factory New)|Mil-Spec|805|MP7|0.18|0.41|138.00
P250 | Ripple (Factory New)|Mil-Spec|806|P250|0.50|0.25|91.00
Sawed-Off | Zander (Factory New)|Mil-Spec|807|Sawed-Off|0.07|0.31|95.00
Galil AR | Crimson Tsunami (Factory New)|Restricted|808|Galil AR|0.08|0.33|129.00
M249 | Emerald Poison Dart (Factory New)|Restricted|809|M249|0.26|0.24|110.00
MAC-10 | Last Dive (Factory New)|Restricted|810|MAC-10|0.09|0.22|92.00
UMP-45 | Scaffold (Factory New)|Restricted|811|UMP-45|0.48|0.41|111.00
XM1014 | Seasons (Factory New)|Restricted|812|XM1014|0.07|0.39|115.00
AWP | Fever Dream (Factory New)|Classified|813|AWP|0.92|0.16|96.00
CZ75-Auto | Xiangliu (Factory New)|Classified|814|CZ75-Auto|0.94|0.31|88.00
M4A1-S | Decimator (Factory New)|Classified|815|M4A1-S|0.65|0.27|64.00
AK-47 | Bloodsport (Factory New)|Covert|816|AK-47|0.05|0.37|84.00
USP-S | Neo-Noir (Factory New)|Covert|817|USP-S|0.89|0.08|107.00
★ Bowie Knife | Damascus Steel (Factory New)|Covert|818|Bowie Knife|0.55|0.09|137.00
★ Bowie Knife | Marble Fade (Factory New)|Covert|820|Bowie Knife|0.97|0.32|92.00
★ Bowie Knife | Tiger Tooth (Factory New)|Covert|821|Bowie Knife|0.10|0.64|136.00
★ Bowie Knife | Ultraviolet (Factory New)|Covert|823|Bowie Knife|0.73|0.23|95.00
★ Butterfly Knife | Damascus Steel (Factory New)|Covert|824|Butterfly Knife|0.56|0.11|122.00
★ Butterfly Knife | Marble Fade (Factory New)|Covert|826|Butterfly Knife|0.00|0.31|78.00
★ Butterfly Knife | Tiger Tooth (Factory New)|Covert|827|Butterfly Knife|0.10|0.58|121.00
★ Butterfly Knife | Ultraviolet (Factory New)|Covert|829|Butterfly Knife|0.70|0.20|81.00
★ Falchion Knife | Damascus Steel (Factory New)|Covert|830|Falchion Knife|0.55|0.10|135.00
★ Falchion Knife | Marble Fade (Factory New)|Covert|832|Falchion Knife|0.01|0.29|83.00
★ Falchion Knife | Tiger Tooth (Factory New)|Covert|833|Falchion Knife|0.09|0.59|143.00
★ Falchion Knife | Ultraviolet (Factory New)|Covert|835|Falchion Knife|0.76|0.33|97.00
★ Huntsman Knife | Damascus Steel (Factory New)|Covert|836|Huntsman Knife|0.55|0.11|151.00
★ Huntsman Knife | Marble Fade (Factory New)|Covert|838|Huntsman Knife|0.96|0.24|140.00
★ Huntsman Knife | Tiger Tooth (Factory New)|Covert|839|Huntsman Knife|0.11|0.65|161.00
★ Huntsman Knife | Ultraviolet (Factory New)|Covert|841|Huntsman Knife|0.76|0.37|91.00
★ Shadow Daggers | Damascus Steel (Factory New)|Covert|842|Shadow Daggers|0.56|0.09|162.00
★ Shadow Daggers | Marble Fade (Factory New)|Covert|844|Shadow Daggers|0.02|0.40|150.00
★ Shadow Daggers | Tiger Tooth (Factory New)|Covert|845|Shadow Daggers|0.10|0.67|180.00
★ Shadow Daggers | Ultraviolet (Factory New)|Covert|847|Shadow Daggers|0.75|0.26|121.00
USP-S | Blueprint (Factory New)|Mil-Spec|848|USP-S|0.60|0.50|109.00
FAMAS | Macabre (Factory New)|Mil-Spec|849|FAMAS|0.14|0.30|118.00
M4A1-S | Briefing (Factory New)|Mil-Spec|850|M4A1-S|0.97|0.07|86.00
MAC-10 | Aloha (Factory New)|Mil-Spec|851|MAC-10|0.09|0.22|115.00
MAG-7 | Hard Water (Factory New)|Mil-Spec|852|MAG-7|0.53|0.22|91.00
Tec-9 | Cut Out (Factory New)|Mil-Spec|853|Tec-9|0.28|0.03|92.00
UMP-45 | Metal Flowers (Factory New)|Mil-Spec|854|UMP-45|0.22|0.03|95.00
AK-47 | Orbit Mk01 (Factory New)|Restricted|855|AK-47|0.02|0.28|76.00
P2000 | Woodsman (Factory New)|Restricted|856|P2000|0.10|0.36|117.00
P250 | Red Rock (Factory New)|Restricted|857|P250|0.08|0.36|140.00
P90 | Death Grip (Factory New)|Restricted|858|P90|0.17|0.05|129.00
SSG 08 | Death's Head (Factory New)|Restricted|859|SSG 08|0.08|0.40|101.00
Dual Berettas | Cobra Strike (Factory New)|Classified|860|Dual Berettas|0.22|0.43|91.00
Galil AR | Sugar Rush (Factory New)|Classified|861|Galil AR|0.76|0.32|133.00
M4A4 | Hellfire (Factory New)|Classified|862|M4A4|0.06|0.40|120.00
Five-SeveN | Hyper Beast (Factory New)|Covert|863|Five-SeveN|0.95|0.20|122.00
AWP | Oni Taiji (Factory New)|Covert|864|AWP|0.01|0.28|96.00
Sawed-Off | Morris (Factory New)|Mil-Spec|865|Sawed-Off|0.09|0.31|96.00
AUG | Triqua (Factory New)|Mil-Spec|866|AUG|0.07|0.16|100.00
G3SG1 | Hunter (Factory New)|Mil-Spec|867|G3SG1|0.07|0.28|94.00
Glock-18 | Off World (Factory New)|Mil-Spec|868|Glock-18|0.55|0.33|108.00
MAC-10 | Oceanic (Factory New)|Mil-Spec|869|MAC-10|0.48|0.15|116.00
Tec-9 | Cracked Opal (Factory New)|Mil-Spec|870|Tec-9|0.11|0.33|96.00
SCAR-20 | Jungle Slipstream (Factory New)|Mil-Spec|871|SCAR-20|0.16|0.39|105.00
MP9 | Goo (Factory New)|Restricted|872|MP9|0.57|0.11|110.00
SG 553 | Phantom (Factory New)|Restricted|873|SG 553|0.08|0.02|87.00
CZ75-Auto | Tacticat (Factory New)|Restricted|874|CZ75-Auto|0.81|0.15|106.00
UMP-45 | Exposure (Factory New)|Restricted|875|UMP-45|0.54|0.53|133.00
XM1014 | Ziggy (Factory New)|Restricted|876|XM1014|0.14|0.13|89.00
PP-Bizon | High Roller (Factory New)|Classified|877|PP-Bizon|0.03|0.26|122.00
M4A1-S | Leaded Glass (Factory New)|Classified|878|M4A1-S|0.07|0.29|93.00
R8 Revolver | Llama Cannon (Factory New)|Classified|879|R8 Revolver|0.17|0.07|98.00
AK-47 | The Empress (Factory New)|Covert|880|AK-47|0.06|0.27|74.00
P250 | See Ya Later (Factory New)|Covert|881|P250|0.28|0.27|115.00
PP-Bizon | Night Riot (Factory New)|Mil-Spec|882|PP-Bizon|0.44|0.10|89.00
Five-SeveN | Flame Test (Factory New)|Mil-Spec|883|Five-SeveN|0.72|0.04|80.00
MP9 | Black Sand (Factory New)|Mil-Spec|884|MP9|0.10|0.30|99.00
P2000 | Urban Hazard (Factory New)|Mil-Spec|885|P2000|0.04|0.22|124.00
R8 Revolver | Grip (Factory New)|Mil-Spec|886|R8 Revolver|0.50|0.11|113.00
SG 553 | Aloha (Factory New)|Mil-Spec|887|SG 553|0.62|0.26|95.00
XM1014 | Oxide Blaze (Factory New)|Mil-Spec|888|XM1014|0.07|0.24|84.00
Glock-18 | Moonrise (Factory New)|Restricted|889|Glock-18|0.77|0.27|97.00
Negev | Lionfish (Factory New)|Restricted|890|Negev|0.04|0.47|130.00
Nova | Wild Six (Factory New)|Restricted|891|Nova|0.09|0.38|97.00
MAG-7 | SWAG-7 (Factory New)|Restricted|892|MAG-7|0.42|0.04|101.00
UMP-45 | Arctic Wolf (Factory New)|Restricted|893|UMP-45|0.17|0.04|119.00
AUG | Stymphalian (Factory New)|Classified|894|AUG|0.09|0.35|118.00
AWP | Mortis (Factory New)|Classified|895|AWP|0.08|0.30|82.00
USP-S | Cortex (Factory New)|Classified|896|USP-S|0.00|0.26|133.00
M4A4 | Neo-Noir (Factory New)|Covert|897|M4A4|0.89|0.10|115.00
MP7 | Bloodsport (Factory New)|Covert|898|MP7|0.06|0.41|120.00
AUG | Amber Slipstream (Factory New)|Mil-Spec|899|AUG|0.09|0.22|116.00
Dual Berettas | Shred (Factory New)|Mil-Spec|900|Dual Berettas|0.56|0.28|109.00
Glock-18 | Warhawk (Factory New)|Mil-Spec|901|Glock-18|0.11|0.20|95.00
MP9 | Capillary (Factory New)|Mil-Spec|902|MP9|0.12|0.08|96.00
P90 | Traction (Factory New)|Mil-Spec|903|P90|0.52|0.23|92.00
R8 Revolver | Survivalist (Factory New)|Mil-Spec|904|R8 Revolver|0.19|0.19|105.00
Tec-9 | Snek-9 (Factory New)|Mil-Spec|905|Tec-9|0.07|0.32|101.00
CZ75-Auto | Eco (Factory New)|Restricted|906|CZ75-Auto|0.24|0.41|162.00
G3SG1 | High Seas (Factory New)|Restricted|907|G3SG1|0.10|0.37|87.00
Nova | Toy Soldier (Factory New)|Restricted|908|Nova|0.24|0.40|123.00
AWP | PAW (Factory New)|Restricted|909|AWP|0.09|0.22|85.00
MP7 | Powercore (Factory New)|Restricted|910|MP7|0.24|0.42|100.00
M4A1-S | Nightmare (Factory New)|Classified|911|M4A1-S|0.55|0.38|101.00
Sawed-Off | Devourer (Factory New)|Classified|912|Sawed-Off|0.10|0.31|124.00
FAMAS | Eye of Athena (Factory New)|Classified|913|FAMAS|0.07|0.39|90.00
AK-47 | Neon Rider (Factory New)|Covert|914|AK-47|0.73|0.29|108.00
Desert Eagle | Code Red (Factory New)|Covert|915|Desert Eagle|0.01|0.46|115.00
★ Stiletto Knife | Vanilla (Factory New)|Covert|916|Stiletto Knife|0.25|0.02|111.00
★ Stiletto Knife | Blue Steel (Factory New)|Covert|917|Stiletto Knife|0.83|0.03|80.00
★ Stiletto Knife | Boreal Forest (Factory New)|Covert|918|Stiletto Knife|0.20|0.23|117.00
★ Stiletto Knife | Case Hardened (Factory New)|Covert|919|Stiletto Knife|0.12|0.13|100.00
★ Stiletto Knife | Crimson Web (Factory New)|Covert|920|Stiletto Knife|0.01|0.44|124.00
★ Stiletto Knife | Fade (Factory New)|Covert|921|Stiletto Knife|0.03|0.26|112.00
★ Stiletto Knife | Forest DDPAT (Factory New)|Covert|922|Stiletto Knife|0.19|0.20|120.00
★ Stiletto Knife | Night Stripe (Factory New)|Covert|923|Stiletto Knife|0.56|0.20|87.00
★ Stiletto Knife | Safari Mesh (Factory New)|Covert|924|Stiletto Knife|0.18|0.17|120.00
★ Stiletto Knife | Scorched (Factory New)|Covert|925|Stiletto Knife|0.11|0.05|115.00
★ Stiletto Knife | Slaughter (Factory New)|Covert|926|Stiletto Knife|0.01|0.39|120.00
★ Stiletto Knife | Stained (Factory New)|Covert|927|Stiletto Knife|0.00|0.02|97.00
★ Stiletto Knife | Urban Masked (Factory New)|Covert|928|Stiletto Knife|0.40|0.03|168.00
★ Ursus Knife | Vanilla (Factory New)|Covert|929|Ursus Knife|0.17|0.07|98.00
★ Ursus Knife | Blue Steel (Factory New)|Covert|930|Ursus Knife|0.55|0.13|105.00
★ Ursus Knife | Boreal Forest (Factory New)|Covert|931|Ursus Knife|0.19|0.18|116.00
★ Ursus Knife | Case Hardened (Factory New)|Covert|932|Ursus Knife|0.14|0.13|120.00
★ Ursus Knife | Crimson Web (Factory New)|Covert|933|Ursus Knife|0.00|0.32|112.00
★ Ursus Knife | Fade (Factory New)|Covert|934|Ursus Knife|0.03|0.29|139.00
★ Ursus Knife | Forest DDPAT (Factory New)|Covert|935|Ursus Knife|0.23|0.21|121.00
★ Ursus Knife | Night Stripe (Factory New)|Covert|936|Ursus Knife|0.56|0.20|84.00
★ Ursus Knife | Safari Mesh (Factory New)|Covert|937|Ursus Knife|0.18|0.18|119.00
★ Ursus Knife | Scorched (Factory New)|Covert|938|Ursus Knife|0.10|0.06|122.00
★ Ursus Knife | Slaughter (Factory New)|Covert|939|Ursus Knife|0.03|0.32|130.00
★ Ursus Knife | Stained (Factory New)|Covert|940|Ursus Knife|0.42|0.05|122.00
★ Ursus Knife | Urban Masked (Factory New)|Covert|941|Ursus Knife|0.40|0.03|165.00
★ Navaja Knife | Vanilla (Factory New)|Covert|942|Navaja Knife|0.07|0.18|154.00
★ Navaja Knife | Blue Steel (Factory New)|Covert|943|Navaja Knife|0.08|0.26|126.00
★ Navaja Knife | Boreal Forest (Factory New)|Covert|944|Navaja Knife|0.20|0.21|117.00
★ Navaja Knife | Case Hardened (Factory New)|Covert|945|Navaja Knife|0.09|0.31|153.00
★ Navaja Knife | Crimson Web (Factory New)|Covert|946|Navaja Knife|0.00|0.42|125.00
★ Navaja Knife | Fade (Factory New)|Covert|947|Navaja Knife|0.03|0.40|158.00
★ Navaja Knife | Forest DDPAT (Factory New)|Covert|948|Navaja Knife|0.19|0.20|122.00
★ Navaja Knife | Night Stripe (Factory New)|Covert|949|Navaja Knife|0.57|0.19|89.00
★ Navaja Knife | Safari Mesh (Factory New)|Covert|950|Navaja Knife|0.17|0.17|123.00
★ Navaja Knife | Scorched (Factory New)|Covert|951|Navaja Knife|0.10|0.06|125.00
★ Navaja Knife | Slaughter (Factory New)|Covert|952|Navaja Knife|0.04|0.46|166.00
★ Navaja Knife | Stained (Factory New)|Covert|953|Navaja Knife|0.07|0.20|146.00
★ Navaja Knife | Urban Masked (Factory New)|Covert|954|Navaja Knife|0.37|0.03|171.00
★ Talon Knife | Vanilla (Factory New)|Covert|955|Talon Knife|0.15|0.06|143.00
★ Talon Knife | Blue Steel (Factory New)|Covert|956|Talon Knife|0.44|0.06|131.00
★ Talon Knife | Boreal Forest (Factory New)|Covert|957|Talon Knife|0.21|0.17|111.00
★ Talon Knife | Case Hardened (Factory New)|Covert|958|Talon Knife|0.17|0.07|145.00
★ Talon Knife | Crimson Web (Factory New)|Covert|959|Talon Knife|0.00|0.32|114.00
★ Talon Knife | Fade (Factory New)|Covert|960|Talon Knife|0.98|0.23|154.00
★ Talon Knife | Forest DDPAT (Factory New)|Covert|961|Talon Knife|0.23|0.17|110.00
★ Talon Knife | Night Stripe (Factory New)|Covert|962|Talon Knife|0.55|0.15|91.00
★ Talon Knife | Safari Mesh (Factory New)|Covert|963|Talon Knife|0.20|0.13|110.00
★ Talon Knife | Scorched (Factory New)|Covert|964|Talon Knife|0.14|0.05|127.00
★ Talon Knife | Slaughter (Factory New)|Covert|965|Talon Knife|0.03|0.26|165.00
★ Talon Knife | Stained (Factory New)|Covert|966|Talon Knife|0.33|0.03|144.00
★ Talon Knife | Urban Masked (Factory New)|Covert|967|Talon Knife|0.44|0.04|146.00
PP-Bizon | Facility Sketch (Factory New)|Consumer Grade|968|PP-Bizon|0.10|0.17|144.00
Souvenir PP-Bizon | Facility Sketch (Factory New)|Consumer Grade|968|PP-Bizon|0.10|0.17|144.00
P250 | Facility Draft (Factory New)|Consumer Grade|969|P250|0.04|0.15|92.00
Souvenir P250 | Facility Draft (Factory New)|Consumer Grade|969|P250|0.04|0.15|92.00
UMP-45 | Facility Dark (Factory New)|Consumer Grade|970|UMP-45|0.25|0.02|84.00
Souvenir UMP-45 | Facility Dark (Factory New)|Consumer Grade|970|UMP-45|0.25|0.02|84.00
Five-SeveN | Coolant (Factory New)|Consumer Grade|971|Five-SeveN|0.37|0.22|125.00
Souvenir Five-SeveN | Coolant (Factory New)|Consumer Grade|971|Five-SeveN|0.37|0.22|125.00
Nova | Mandrel (Factory New)|Consumer Grade|972|Nova|0.12|0.15|121.00
Souvenir Nova | Mandrel (Factory New)|Consumer Grade|972|Nova|0.12|0.15|121.00
M4A4 | Mainframe (Factory New)|Industrial Grade|973|M4A4|0.17|0.07|83.00
Souvenir M4A4 | Mainframe (Factory New)|Industrial Grade|973|M4A4|0.17|0.07|83.00
MP7 | Motherboard (Factory New)|Industrial Grade|974|MP7|0.27|0.23|101.00
Souvenir MP7 | Motherboard (Factory New)|Industrial Grade|974|MP7|0.27|0.23|101.00
Negev | Bulkhead (Factory New)|Industrial Grade|975|Negev|0.11|0.53|128.00
Souvenir Negev | Bulkhead (Factory New)|Industrial Grade|975|Negev|0.11|0.53|128.00
Galil AR | Cold Fusion (Factory New)|Industrial Grade|976|Galil AR|0.54|0.22|100.00
Souvenir Galil AR | Cold Fusion (Factory New)|Industrial Grade|976|Galil AR|0.54|0.22|100.00
P90 | Facility Negative (Factory New)|Mil-Spec|977|P90|0.24|0.10|111.00
Souvenir P90 | Facility Negative (Factory New)|Mil-Spec|977|P90|0.24|0.10|111.00
MP5-SD | Co-Processor (Factory New)|Mil-Spec|978|MP5-SD|0.56|0.31|104.00
Souvenir MP5-SD | Co-Processor (Factory New)|Mil-Spec|978|MP5-SD|0.56|0.31|104.00
P250 | Exchanger (Factory New)|Mil-Spec|979|P250|0.14|0.14|109.00
Souvenir P250 | Exchanger (Factory New)|Mil-Spec|979|P250|0.14|0.14|109.00
AWP | Acheron (Factory New)|Mil-Spec|980|AWP|0.03|0.10|97.00
Souvenir AWP | Acheron (Factory New)|Mil-Spec|980|AWP|0.03|0.10|97.00
AUG | Random Access (Factory New)|Restricted|981|AUG|0.04|0.24|112.00
Souvenir AUG | Random Access (Factory New)|Restricted|981|AUG|0.04|0.24|112.00
MAG-7 | Core Breach (Factory New)|Restricted|982|MAG-7|0.03|0.62|120.00
Souvenir MAG-7 | Core Breach (Factory New)|Restricted|982|MAG-7|0.03|0.62|120.00
Glock-18 | Nuclear Garden (Factory New)|Restricted|983|Glock-18|0.21|0.41|92.00
Souvenir Glock-18 | Nuclear Garden (Factory New)|Restricted|983|Glock-18|0.21|0.41|92.00
Tec-9 | Remote Control (Factory New)|Classified|984|Tec-9|0.15|0.09|101.00
Souvenir Tec-9 | Remote Control (Factory New)|Classified|984|Tec-9|0.15|0.09|101.00
M4A1-S | Control Panel (Factory New)|Classified|985|M4A1-S|0.50|0.10|72.00
Souvenir M4A1-S | Control Panel (Factory New)|Classified|985|M4A1-S|0.50|0.10|72.00
UMP-45 | Mudder (Factory New)|Consumer Grade|986|UMP-45|0.12|0.23|110.00
Souvenir UMP-45 | Mudder (Factory New)|Consumer Grade|986|UMP-45|0.12|0.23|110.00
MP5-SD | Dirt Drop (Factory New)|Consumer Grade|987|MP5-SD|0.12|0.10|103.00
Souvenir MP5-SD | Dirt Drop (Factory New)|Consumer Grade|987|MP5-SD|0.12|0.10|103.00
MP9 | Slide (Factory New)|Consumer Grade|988|MP9|0.08|0.40|85.00
Souvenir MP9 | Slide (Factory New)|Consumer Grade|988|MP9|0.08|0.40|85.00
AUG | Sweeper (Factory New)|Consumer Grade|989|AUG|0.07|0.32|109.00
Souvenir AUG | Sweeper (Factory New)|Consumer Grade|989|AUG|0.07|0.32|109.00
MAG-7 | Rust Coat (Factory New)|Consumer Grade|990|MAG-7|0.53|0.05|97.00
Souvenir MAG-7 | Rust Coat (Factory New)|Consumer Grade|990|MAG-7|0.53|0.05|97.00
PP-Bizon | Candy Apple (Factory New)|Industrial Grade|991|PP-Bizon|0.01|0.40|128.00
Souvenir PP-Bizon | Candy Apple (Factory New)|Industrial Grade|991|PP-Bizon|0.01|0.40|128.00
MAC-10 | Calf Skin (Factory New)|Industrial Grade|992|MAC-10|0.09|0.22|112.00
Souvenir MAC-10 | Calf Skin (Factory New)|Industrial Grade|992|MAC-10|0.09|0.22|112.00
R8 Revolver | Nitro (Factory New)|Industrial Grade|993|R8 Revolver|0.06|0.35|144.00
Souvenir R8 Revolver | Nitro (Factory New)|Industrial Grade|993|R8 Revolver|0.06|0.35|144.00
Glock-18 | High Beam (Factory New)|Industrial Grade|994|Glock-18|0.58|0.13|104.00
Souvenir Glock-18 | High Beam (Factory New)|Industrial Grade|994|Glock-18|0.58|0.13|104.00
SSG 08 | Hand Brake (Factory New)|Mil-Spec|995|SSG 08|0.43|0.09|105.00
Souvenir SSG 08 | Hand Brake (Factory New)|Mil-Spec|995|SSG 08|0.43|0.09|105.00
M4A4 | Converter (Factory New)|Mil-Spec|996|M4A4|0.01|0.33|92.00
Souvenir M4A4 | Converter (Factory New)|Mil-Spec|996|M4A4|0.01|0.33|92.00
USP-S | Check Engine (Factory New)|Mil-Spec|997|USP-S|0.01|0.60|122.00
Souvenir USP-S | Check Engine (Factory New)|Mil-Spec|997|USP-S|0.01|0.60|122.00
Sawed-Off | Brake Light (Factory New)|Mil-Spec|998|Sawed-Off|0.05|0.31|103.00
Souvenir Sawed-Off | Brake Light (Factory New)|Mil-Spec|998|Sawed-Off|0.05|0.31|103.00
P250 | Vino Primo (Factory New)|Restricted|999|P250|0.94|0.25|81.00
Souvenir P250 | Vino Primo (Factory New)|Restricted|999|P250|0.94|0.25|81.00
MP7 | Fade (Factory New)|Restricted|1000|MP7|0.04|0.28|102.00
Souvenir MP7 | Fade (Factory New)|Restricted|1000|MP7|0.04|0.28|102.00
AK-47 | Safety Net (Factory New)|Restricted|1001|AK-47|0.07|0.52|149.00
Souvenir AK-47 | Safety Net (Factory New)|Restricted|1001|AK-47|0.07|0.52|149.00
Dual Berettas | Twin Turbo (Factory New)|Classified|1002|Dual Berettas|0.09|0.37|125.00
Souvenir Dual Berettas | Twin Turbo (Factory New)|Classified|1002|Dual Berettas|0.09|0.37|125.00
SG 553 | Integrale (Factory New)|Classified|1003|SG 553|0.80|0.08|111.00
Souvenir SG 553 | Integrale (Factory New)|Classified|1003|SG 553|0.80|0.08|111.00
MP9 | Modest Threat (Factory New)|Mil-Spec|1005|MP9|0.07|0.43|104.00
Glock-18 | Oxide Blaze (Factory New)|Mil-Spec|1006|Glock-18|0.09|0.15|116.00
Nova | Wood Fired (Factory New)|Mil-Spec|1007|Nova|0.18|0.23|83.00
M4A4 | Magnesium (Factory New)|Mil-Spec|1008|M4A4|0.07|0.05|100.00
Sawed-Off | Black Sand (Factory New)|Mil-Spec|1009|Sawed-Off|0.10|0.31|108.00
SG 553 | Danger Close (Factory New)|Mil-Spec|1010|SG 553|0.06|0.28|97.00
G3SG1 | Scavenger (Factory New)|Restricted|1012|G3SG1|0.10|0.41|81.00
Galil AR | Signal (Factory New)|Restricted|1013|Galil AR|0.89|0.24|85.00
MAC-10 | Pipe Down (Factory New)|Restricted|1014|MAC-10|0.06|0.17|134.00
P250 | Nevermore (Factory New)|Restricted|1015|P250|0.01|0.45|121.00
USP-S | Flashback (Factory New)|Restricted|1016|USP-S|0.14|0.22|107.00
UMP-45 | Momentum (Factory New)|Classified|1017|UMP-45|0.04|0.11|123.00
Desert Eagle | Mecha Industries (Factory New)|Classified|1018|Desert Eagle|0.11|0.17|131.00
MP5-SD | Phosphor (Factory New)|Classified|1019|MP5-SD|0.45|0.30|98.00
AK-47 | Asiimov (Factory New)|Covert|1020|AK-47|0.06|0.36|148.00
AWP | Neo-Noir (Factory New)|Covert|1021|AWP|0.59|0.15|108.00
FAMAS | Crypsis (Factory New)|Mil-Spec|1022|FAMAS|0.08|0.42|115.00
AK-47 | Uncharted (Factory New)|Mil-Spec|1023|AK-47|0.09|0.22|83.00
MAC-10 | Whitefish (Factory New)|Mil-Spec|1024|MAC-10|0.22|0.05|121.00
Galil AR | Akoben (Factory New)|Mil-Spec|1025|Galil AR|0.07|0.18|127.00
P250 | Verdigris (Factory New)|Mil-Spec|1027|P250|0.13|0.29|92.00
P90 | Off World (Factory New)|Mil-Spec|1028|P90|0.53|0.30|102.00
AWP | Atheris (Factory New)|Restricted|1029|AWP|0.52|0.40|95.00
Tec-9 | Bamboozle (Factory New)|Restricted|1030|Tec-9|0.22|0.38|104.00
Desert Eagle | Light Rail (Factory New)|Restricted|1031|Desert Eagle|0.10|0.19|63.00
MP5-SD | Gauss (Factory New)|Restricted|1032|MP5-SD|0.08|0.19|135.00
UMP-45 | Moonrise (Factory New)|Restricted|1033|UMP-45|0.85|0.17|76.00
AUG | Momentum (Factory New)|Classified|1035|AUG|0.25|0.04|106.00
Five-SeveN | Angry Mob (Factory New)|Covert|1037|Five-SeveN|0.13|0.33|119.00
M4A4 | The Emperor (Factory New)|Covert|1038|M4A4|0.62|0.25|91.00
★ Navaja Knife | Damascus Steel (Factory New)|Covert|1039|Navaja Knife|0.08|0.23|155.00
★ Navaja Knife | Marble Fade (Factory New)|Covert|1041|Navaja Knife|0.05|0.39|131.00
★ Navaja Knife | Tiger Tooth (Factory New)|Covert|1043|Navaja Knife|0.09|0.59|173.00
★ Navaja Knife | Ultraviolet (Factory New)|Covert|1044|Navaja Knife|0.74|0.29|105.00
★ Stiletto Knife | Damascus Steel (Factory New)|Covert|1045|Stiletto Knife|0.08|0.02|107.00
★ Stiletto Knife | Marble Fade (Factory New)|Covert|1047|Stiletto Knife|0.04|0.24|82.00
★ Stiletto Knife | Tiger Tooth (Factory New)|Covert|1049|Stiletto Knife|0.09|0.56|126.00
★ Stiletto Knife | Ultraviolet (Factory New)|Covert|1050|Stiletto Knife|0.73|0.26|105.00
★ Talon Knife | Damascus Steel (Factory New)|Covert|1051|Talon Knife|0.25|0.05|153.00
★ Talon Knife | Marble Fade (Factory New)|Covert|1053|Talon Knife|0.03|0.12|126.00
★ Talon Knife | Tiger Tooth (Factory New)|Covert|1055|Talon Knife|0.10|0.41|172.00
★ Talon Knife | Ultraviolet (Factory New)|Covert|1056|Talon Knife|0.71|0.18|103.00
★ Ursus Knife | Damascus Steel (Factory New)|Covert|1057|Ursus Knife|0.31|0.05|125.00
★ Ursus Knife | Marble Fade (Factory New)|Covert|1059|Ursus Knife|0.99|0.21|112.00
★ Ursus Knife | Tiger Tooth (Factory New)|Covert|1061|Ursus Knife|0.11|0.52|135.00
★ Ursus Knife | Ultraviolet (Factory New)|Covert|1062|Ursus Knife|0.74|0.36|113.00
P250 | X-Ray (Factory New)|Restricted|1063|P250|0.45|0.41|123.00
Dual Berettas | Elite 1.6 (Factory New)|Mil-Spec|1064|Dual Berettas|0.17|0.03|97.00
Tec-9 | Flash Out (Factory New)|Mil-Spec|1065|Tec-9|0.12|0.24|121.00
MAC-10 | Classic Crate (Factory New)|Mil-Spec|1066|MAC-10|0.15|0.19|93.00
MAG-7 | Popdog (Factory New)|Mil-Spec|1067|MAG-7|0.17|0.14|81.00
SCAR-20 | Assault (Factory New)|Mil-Spec|1068|SCAR-20|0.58|0.18|109.00
FAMAS | Decommissioned (Factory New)|Mil-Spec|1069|FAMAS|0.07|0.23|81.00
Glock-18 | Sacrifice (Factory New)|Mil-Spec|1070|Glock-18|0.04|0.09|96.00
M249 | Aztec (Factory New)|Restricted|1071|M249|0.20|0.16|105.00
MP5-SD | Agent (Factory New)|Restricted|1072|MP5-SD|0.29|0.08|95.00
Five-SeveN | Buddy (Factory New)|Restricted|1073|Five-SeveN|0.12|0.27|121.00
P250 | Inferno (Factory New)|Restricted|1074|P250|0.10|0.42|106.00
UMP-45 | Plastique (Factory New)|Restricted|1075|UMP-45|0.40|0.15|104.00
MP9 | Hydra (Factory New)|Classified|1076|MP9|0.22|0.47|128.00
P90 | Nostalgia (Factory New)|Classified|1077|P90|0.09|0.18|120.00
AUG | Death by Puppy (Factory New)|Classified|1078|AUG|0.60|0.09|93.00
AWP | Wildfire (Factory New)|Covert|1079|AWP|0.05|0.53|115.00
FAMAS | Commemoration (Factory New)|Covert|1080|FAMAS|0.10|0.53|99.00
★ Classic Knife | Vanilla (Factory New)|Covert|1081|Classic Knife|0.33|0.01|114.00
★ Classic Knife | Fade (Factory New)|Covert|1082|Classic Knife|0.00|0.30|127.00
★ Classic Knife | Slaughter (Factory New)|Covert|1083|Classic Knife|0.00|0.37|143.00
★ Classic Knife | Blue Steel (Factory New)|Covert|1084|Classic Knife|0.57|0.11|83.00
★ Classic Knife | Stained (Factory New)|Covert|1085|Classic Knife|0.57|0.09|112.00
★ Classic Knife | Case Hardened (Factory New)|Covert|1086|Classic Knife|0.21|0.05|140.00
★ Classic Knife | Forest DDPAT (Factory New)|Covert|1087|Classic Knife|0.19|0.20|132.00
★ Classic Knife | Boreal Forest (Factory New)|Covert|1088|Classic Knife|0.22|0.21|131.00
★ Classic Knife | Crimson Web (Factory New)|Covert|1089|Classic Knife|0.01|0.38|130.00
★ Classic Knife | Scorched (Factory New)|Covert|1090|Classic Knife|0.10|0.07|121.00
★ Classic Knife | Safari Mesh (Factory New)|Covert|1091|Classic Knife|0.17|0.18|136.00
★ Classic Knife | Night Stripe (Factory New)|Covert|1092|Classic Knife|0.55|0.17|95.00
★ Classic Knife | Urban Masked (Factory New)|Covert|1093|Classic Knife|0.30|0.03|187.00
MP5-SD | Bamboo Garden (Factory New)|Consumer Grade|1094|MP5-SD|0.18|0.20|127.00
MAC-10 | Surfwood (Factory New)|Consumer Grade|1095|MAC-10|0.24|0.18|166.00
PP-Bizon | Seabird (Factory New)|Consumer Grade|1096|PP-Bizon|0.43|0.19|150.00
Sawed-Off | Jungle Thicket (Factory New)|Consumer Grade|1097|Sawed-Off|0.23|0.39|76.00
M249 | Jungle (Factory New)|Consumer Grade|1098|M249|0.30|0.23|117.00
P90 | Sunset Lily (Factory New)|Industrial Grade|1099|P90|0.04|0.33|90.00
M4A4 | Dark Blossom (Factory New)|Industrial Grade|1100|M4A4|0.56|0.22|77.00
XM1014 | Banana Leaf (Factory New)|Industrial Grade|1101|XM1014|0.20|0.36|74.00
Tec-9 | Rust Leaf (Factory New)|Industrial Grade|1102|Tec-9|0.09|0.42|105.00
UMP-45 | Day Lily (Factory New)|Mil-Spec|1103|UMP-45|0.12|0.17|89.00
Five-SeveN | Crimson Blossom (Factory New)|Mil-Spec|1104|Five-SeveN|0.97|0.37|93.00
MP7 | Teal Blossom (Factory New)|Mil-Spec|1105|MP7|0.33|0.18|77.00
FAMAS | Sundown (Factory New)|Mil-Spec|1106|FAMAS|0.67|0.16|85.00
SSG 08 | Sea Calico (Factory New)|Restricted|1107|SSG 08|0.18|0.24|84.00
Glock-18 | Synth Leaf (Factory New)|Restricted|1108|Glock-18|0.56|0.36|75.00
AUG | Midnight Lily (Factory New)|Restricted|1109|AUG|0.21|0.04|103.00
MP9 | Wild Lily (Factory New)|Classified|1110|MP9|0.76|0.20|99.00
AK-47 | Wild Lotus (Factory New)|Covert|1111|AK-47|0.14|0.33|87.00
AUG | Navy Murano (Factory New)|Consumer Grade|1112|AUG|0.63|0.25|85.00
SCAR-20 | Stone Mosaico (Factory New)|Consumer Grade|1113|SCAR-20|0.14|0.14|98.00
R8 Revolver | Canal Spray (Factory New)|Consumer Grade|1114|R8 Revolver|0.50|0.28|92.00
Negev | Boroque Sand (Factory New)|Consumer Grade|1115|Negev|0.17|0.15|111.00
CZ75-Auto | Indigo (Factory New)|Consumer Grade|1116|CZ75-Auto|0.59|0.19|113.00
AK-47 | Baroque Purple (Factory New)|Industrial Grade|1117|AK-47|0.00|0.01|85.00
SG 553 | Candy Apple (Factory New)|Industrial Grade|1118|SG 553|0.01|0.47|135.00
P250 | Dark Filigree (Factory New)|Industrial Grade|1119|P250|0.83|0.01|88.00
Tec-9 | Orange Murano (Factory New)|Industrial Grade|1120|Tec-9|0.08|0.33|110.00
P90 | Baroque Red (Factory New)|Mil-Spec|1121|P90|0.06|0.15|106.00
G3SG1 | Violet Murano (Factory New)|Mil-Spec|1122|G3SG1|0.69|0.10|72.00
Dual Berettas | Emerald (Factory New)|Mil-Spec|1123|Dual Berettas|0.41|0.39|106.00
SSG 08 | Orange Filigree (Factory New)|Mil-Spec|1124|SSG 08|0.07|0.37|86.00
MP9 | Stained Glass (Factory New)|Restricted|1125|MP9|0.58|0.40|89.00
MAC-10 | Red Filigree (Factory New)|Restricted|1126|MAC-10|0.06|0.17|107.00
Nova | Baroque Orange (Factory New)|Restricted|1127|Nova|0.08|0.24|93.00
MAG-7 | Cinquedea (Factory New)|Classified|1128|MAG-7|0.05|0.35|110.00
AWP | The Prince (Factory New)|Covert|1129|AWP|0.11|0.23|82.00
SG 553 | Barricade (Factory New)|Consumer Grade|1130|SG 553|0.38|0.09|82.00
Galil AR | Tornado (Factory New)|Consumer Grade|1131|Galil AR|0.50|0.02|131.00
MP7 | Scorched (Factory New)|Consumer Grade|1132|MP7|0.09|0.08|112.00
SSG 08 | Red Stone (Factory New)|Consumer Grade|1133|SSG 08|0.06|0.21|100.00
FAMAS | Night Borre (Factory New)|Consumer Grade|1134|FAMAS|0.60|0.11|91.00
M4A1-S | Moss Quartz (Factory New)|Industrial Grade|1135|M4A1-S|0.26|0.24|101.00
USP-S | Pathfinder (Factory New)|Industrial Grade|1136|USP-S|0.15|0.07|107.00
MAG-7 | Chainmail (Factory New)|Industrial Grade|1137|MAG-7|0.15|0.15|95.00
Dual Berettas | Pyre (Factory New)|Industrial Grade|1138|Dual Berettas|0.06|0.35|83.00
SCAR-20 | Brass (Factory New)|Mil-Spec|1139|SCAR-20|0.16|0.25|77.00
CZ75-Auto | Emerald Quartz (Factory New)|Mil-Spec|1140|CZ75-Auto|0.24|0.30|118.00
XM1014 | Frost Borre (Factory New)|Mil-Spec|1141|XM1014|0.57|0.05|97.00
MAC-10 | Copper Borre (Factory New)|Mil-Spec|1142|MAC-10|0.12|0.25|118.00
AUG | Flame Jörmungandr (Factory New)|Restricted|1143|AUG|0.08|0.37|115.00
Desert Eagle | Emerald Jörmungandr (Factory New)|Restricted|1144|Desert Eagle|0.35|0.35|83.00
P90 | Astral Jörmungandr (Factory New)|Restricted|1145|P90|0.46|0.31|89.00
Negev | Mjölnir (Factory New)|Classified|1146|Negev|0.04|0.62|128.00
AWP | Gungnir (Factory New)|Covert|1147|AWP|0.30|0.05|107.00
MP5-SD | Acid Wash (Factory New)|Mil-Spec|1148|MP5-SD|0.44|0.04|77.00
Nova | Plume (Factory New)|Mil-Spec|1149|Nova|0.07|0.31|130.00
G3SG1 | Black Sand (Factory New)|Mil-Spec|1150|G3SG1|0.10|0.33|107.00
R8 Revolver | Memento (Factory New)|Mil-Spec|1151|R8 Revolver|0.12|0.25|143.00
Dual Berettas | Balance (Factory New)|Mil-Spec|1152|Dual Berettas|0.11|0.15|114.00
SCAR-20 | Torn (Factory New)|Mil-Spec|1153|SCAR-20|0.14|0.17|129.00
M249 | Warbird (Factory New)|Mil-Spec|1154|M249|0.11|0.18|110.00
PP-Bizon | Embargo (Factory New)|Restricted|1155|PP-Bizon|0.23|0.15|101.00
AK-47 | Rat Rod (Factory New)|Restricted|1156|AK-47|0.15|0.10|80.00
AUG | Arctic Wolf (Factory New)|Restricted|1157|AUG|0.07|0.10|116.00
MP7 | Neon Ply (Factory New)|Restricted|1158|MP7|0.31|0.17|88.00
P2000 | Obsidian (Factory New)|Restricted|1159|P2000|0.01|0.48|126.00
Tec-9 | Decimator (Factory New)|Classified|1160|Tec-9|0.74|0.27|102.00
SG 553 | Colony IV (Factory New)|Classified|1161|SG 553|0.10|0.52|112.00
AWP | Containment Breach (Factory New)|Covert|1163|AWP|0.23|0.46|113.00
MAC-10 | Stalker (Factory New)|Covert|1164|MAC-10|0.14|0.33|90.00
★ Nomad Knife | Vanilla (Factory New)|Covert|1165|Nomad Knife|0.54|0.06|69.00
★ Nomad Knife | Fade (Factory New)|Covert|1166|Nomad Knife|0.00|0.25|152.00
★ Nomad Knife | Slaughter (Factory New)|Covert|1167|Nomad Knife|0.99|0.30|149.00
★ Nomad Knife | Blue Steel (Factory New)|Covert|1168|Nomad Knife|0.59|0.18|113.00
★ Nomad Knife | Stained (Factory New)|Covert|1169|Nomad Knife|0.57|0.11|153.00
★ Nomad Knife | Case Hardened (Factory New)|Covert|1170|Nomad Knife|0.64|0.04|152.00
★ Nomad Knife | Forest DDPAT (Factory New)|Covert|1171|Nomad Knife|0.21|0.18|141.00
★ Nomad Knife | Boreal Forest (Factory New)|Covert|1172|Nomad Knife|0.25|0.18|135.00
★ Nomad Knife | Crimson Web (Factory New)|Covert|1173|Nomad Knife|0.00|0.33|134.00
★ Nomad Knife | Scorched (Factory New)|Covert|1174|Nomad Knife|0.10|0.05|134.00
★ Nomad Knife | Safari Mesh (Factory New)|Covert|1175|Nomad Knife|0.19|0.17|139.00
★ Nomad Knife | Night Stripe (Factory New)|Covert|1176|Nomad Knife|0.56|0.19|99.00
★ Nomad Knife | Urban Masked (Factory New)|Covert|1177|Nomad Knife|0.39|0.03|186.00
★ Skeleton Knife | Vanilla (Factory New)|Covert|1178|Skeleton Knife|0.54|0.06|62.00
★ Skeleton Knife | Fade (Factory New)|Covert|1179|Skeleton Knife|0.01|0.29|170.00
★ Skeleton Knife | Slaughter (Factory New)|Covert|1180|Skeleton Knife|0.99|0.44|162.00
★ Skeleton Knife | Blue Steel (Factory New)|Covert|1181|Skeleton Knife|0.58|0.28|116.00
★ Skeleton Knife | Stained (Factory New)|Covert|1182|Skeleton Knife|0.57|0.14|154.00
★ Skeleton Knife | Case Hardened (Factory New)|Covert|1183|Skeleton Knife|0.17|0.02|151.00
★ Skeleton Knife | Forest DDPAT (Factory New)|Covert|1184|Skeleton Knife|0.19|0.18|120.00
★ Skeleton Knife | Boreal Forest (Factory New)|Covert|1185|Skeleton Knife|0.20|0.19|112.00
★ Skeleton Knife | Scorched (Factory New)|Covert|1187|Skeleton Knife|0.10|0.05|136.00
★ Skeleton Knife | Safari Mesh (Factory New)|Covert|1188|Skeleton Knife|0.19|0.16|115.00
★ Skeleton Knife | Night Stripe (Factory New)|Covert|1189|Skeleton Knife|0.56|0.16|86.00
★ Skeleton Knife | Urban Masked (Factory New)|Covert|1190|Skeleton Knife|0.38|0.02|163.00
★ Survival Knife | Vanilla (Factory New)|Covert|1191|Survival Knife|0.54|0.10|155.00
★ Survival Knife | Fade (Factory New)|Covert|1192|Survival Knife|0.99|0.30|145.00
★ Survival Knife | Slaughter (Factory New)|Covert|1193|Survival Knife|0.99|0.39|143.00
★ Survival Knife | Blue Steel (Factory New)|Covert|1194|Survival Knife|0.58|0.25|110.00
★ Survival Knife | Stained (Factory New)|Covert|1195|Survival Knife|0.57|0.13|138.00
★ Survival Knife | Case Hardened (Factory New)|Covert|1196|Survival Knife|0.10|0.04|137.00
★ Survival Knife | Forest DDPAT (Factory New)|Covert|1197|Survival Knife|0.21|0.19|129.00
★ Survival Knife | Boreal Forest (Factory New)|Covert|1198|Survival Knife|0.20|0.18|122.00
★ Survival Knife | Crimson Web (Factory New)|Covert|1199|Survival Knife|0.01|0.37|125.00
★ Survival Knife | Scorched (Factory New)|Covert|1200|Survival Knife|0.10|0.06|129.00
★ Survival Knife | Safari Mesh (Factory New)|Covert|1201|Survival Knife|0.18|0.17|126.00
★ Survival Knife | Night Stripe (Factory New)|Covert|1202|Survival Knife|0.56|0.18|91.00
★ Survival Knife | Urban Masked (Factory New)|Covert|1203|Survival Knife|0.37|0.03|173.00
★ Paracord Knife | Vanilla (Factory New)|Covert|1204|Paracord Knife|0.50|0.06|66.00
★ Paracord Knife | Fade (Factory New)|Covert|1205|Paracord Knife|0.03|0.27|113.00
★ Paracord Knife | Slaughter (Factory New)|Covert|1206|Paracord Knife|0.00|0.31|119.00
★ Paracord Knife | Blue Steel (Factory New)|Covert|1207|Paracord Knife|0.50|0.04|79.00
★ Paracord Knife | Stained (Factory New)|Covert|1208|Paracord Knife|0.53|0.06|105.00
★ Paracord Knife | Case Hardened (Factory New)|Covert|1209|Paracord Knife|0.20|0.04|122.00
★ Paracord Knife | Forest DDPAT (Factory New)|Covert|1210|Paracord Knife|0.14|0.20|119.00
★ Paracord Knife | Boreal Forest (Factory New)|Covert|1211|Paracord Knife|0.32|0.23|122.00
★ Paracord Knife | Crimson Web (Factory New)|Covert|1212|Paracord Knife|0.01|0.32|109.00
★ Paracord Knife | Scorched (Factory New)|Covert|1213|Paracord Knife|0.09|0.08|114.00
★ Paracord Knife | Safari Mesh (Factory New)|Covert|1214|Paracord Knife|0.17|0.19|128.00
★ Paracord Knife | Night Stripe (Factory New)|Covert|1215|Paracord Knife|0.56|0.20|86.00
★ Paracord Knife | Urban Masked (Factory New)|Covert|1216|Paracord Knife|0.33|0.02|178.00
AUG | Tom Cat (Factory New)|Mil-Spec|1217|AUG|0.20|0.09|121.00
AWP | Capillary (Factory New)|Mil-Spec|1218|AWP|0.13|0.08|116.00
CZ75-Auto | Distressed (Factory New)|Mil-Spec|1219|CZ75-Auto|0.06|0.28|118.00
Desert Eagle | Blue Ply (Factory New)|Mil-Spec|1220|Desert Eagle|0.58|0.31|110.00
MP5-SD | Desert Strike (Factory New)|Mil-Spec|1221|MP5-SD|0.12|0.18|119.00
Negev | Prototype (Factory New)|Mil-Spec|1222|Negev|0.13|0.09|111.00
R8 Revolver | Bone Forged (Factory New)|Mil-Spec|1223|R8 Revolver|0.12|0.08|101.00
P2000 | Acid Etched (Factory New)|Restricted|1224|P2000|0.33|0.22|77.00
Sawed-Off | Apocalypto (Factory New)|Restricted|1225|Sawed-Off|0.68|0.17|111.00
SCAR-20 | Enforcer (Factory New)|Restricted|1226|SCAR-20|0.03|0.13|84.00
SG 553 | Darkwing (Factory New)|Restricted|1227|SG 553|0.00|0.37|99.00
SSG 08 | Fever Dream (Factory New)|Restricted|1228|SSG 08|0.92|0.06|98.00
AK-47 | Phantom Disruptor (Factory New)|Classified|1229|AK-47|0.12|0.31|112.00
MAC-10 | Disco Tech (Factory New)|Classified|1230|MAC-10|0.02|0.23|158.00
MAG-7 | Justice (Factory New)|Classified|1231|MAG-7|0.29|0.07|59.00
M4A1-S | Player Two (Factory New)|Covert|1232|M4A1-S|0.20|0.04|119.00
Glock-18 | Bullet Queen (Factory New)|Covert|1233|Glock-18|0.07|0.55|145.00
Negev | Ultralight (Factory New)|Mil-Spec|1234|Negev|0.17|0.10|108.00
P2000 | Gnarled (Factory New)|Mil-Spec|1235|P2000|0.67|0.01|79.00
SG 553 | Ol' Rusty (Factory New)|Mil-Spec|1236|SG 553|0.05|0.20|95.00
SSG 08 | Mainframe 001 (Factory New)|Mil-Spec|1237|SSG 08|0.58|0.21|90.00
P250 | Cassette (Factory New)|Mil-Spec|1238|P250|0.05|0.24|117.00
P90 | Freight (Factory New)|Mil-Spec|1239|P90|0.06|0.27|100.00
PP-Bizon | Runic (Factory New)|Mil-Spec|1240|PP-Bizon|0.05|0.23|74.00
MAG-7 | Monster Call (Factory New)|Restricted|1241|MAG-7|0.58|0.16|94.00
Tec-9 | Brother (Factory New)|Restricted|1242|Tec-9|0.10|0.34|105.00
MAC-10 | Allure (Factory New)|Restricted|1243|MAC-10|0.11|0.24|123.00
Galil AR | Connexion (Factory New)|Restricted|1244|Galil AR|0.05|0.33|93.00
MP5-SD | Kitbash (Factory New)|Restricted|1245|MP5-SD|0.11|0.14|127.00
M4A4 | Tooth Fairy (Factory New)|Classified|1246|M4A4|0.06|0.20|128.00
Glock-18 | Vogue (Factory New)|Classified|1247|Glock-18|0.95|0.47|127.00
XM1014 | Entombed (Factory New)|Classified|1248|XM1014|0.11|0.21|111.00
Desert Eagle | Printstream (Factory New)|Covert|1249|Desert Eagle|0.11|0.09|164.00
AK-47 | Legion of Anubis (Factory New)|Covert|1250|AK-47|0.10|0.24|71.00
CZ75-Auto | Vendetta (Factory New)|Mil-Spec|1251|CZ75-Auto|0.09|0.25|91.00
P90 | Cocoa Rampage (Factory New)|Mil-Spec|1252|P90|0.11|0.27|97.00
G3SG1 | Digital Mesh (Factory New)|Mil-Spec|1253|G3SG1|0.11|0.13|94.00
Galil AR | Vandal (Factory New)|Mil-Spec|1254|Galil AR|0.14|0.17|95.00
P250 | Contaminant (Factory New)|Mil-Spec|1255|P250|0.00|0.28|95.00
M249 | Deep Relief (Factory New)|Mil-Spec|1256|M249|0.19|0.20|108.00
MP5-SD | Condition Zero (Factory New)|Mil-Spec|1257|MP5-SD|0.50|0.07|99.00
AWP | Exoskeleton (Factory New)|Restricted|1258|AWP|0.50|0.07|76.00
Dual Berettas | Dezastre (Factory New)|Restricted|1259|Dual Berettas|0.52|0.08|106.00
Nova | Clear Polymer (Factory New)|Restricted|1260|Nova|0.42|0.09|120.00
SSG 08 | Parallax (Factory New)|Restricted|1261|SSG 08|0.12|0.04|96.00
UMP-45 | Gold Bismuth (Factory New)|Restricted|1262|UMP-45|0.13|0.12|107.00
Five-SeveN | Fairy Tale (Factory New)|Classified|1263|Five-SeveN|0.94|0.25|153.00
M4A4 | Cyber Security (Factory New)|Classified|1264|M4A4|0.08|0.28|131.00
USP-S | Monster Mashup (Factory New)|Classified|1265|USP-S|0.39|0.37|109.00
M4A1-S | Printstream (Factory New)|Covert|1266|M4A1-S|0.12|0.07|150.00
Glock-18 | Neo-Noir (Factory New)|Covert|1267|Glock-18|0.85|0.10|109.00
XM1014 | Charter (Factory New)|Consumer Grade|1268|XM1014|0.12|0.17|104.00
AUG | Surveillance (Factory New)|Consumer Grade|1269|AUG|0.26|0.07|96.00
MP9 | Army Sheen (Factory New)|Consumer Grade|1270|MP9|0.19|0.13|92.00
P250 | Forest Night (Factory New)|Consumer Grade|1271|P250|0.54|0.18|118.00
CZ75-Auto | Jungle Dashed (Factory New)|Consumer Grade|1272|CZ75-Auto|0.21|0.23|90.00
Desert Eagle | The Bronze (Factory New)|Industrial Grade|1273|Desert Eagle|0.11|0.10|89.00
Dual Berettas | Switch Board (Factory New)|Industrial Grade|1274|Dual Berettas|0.16|0.38|109.00
MP5-SD | Nitro (Factory New)|Industrial Grade|1275|MP5-SD|0.07|0.27|140.00
MAG-7 | Carbon Fiber (Factory New)|Industrial Grade|1276|MAG-7|0.33|0.03|103.00
M4A4 | Global Offensive (Factory New)|Mil-Spec|1277|M4A4|0.19|0.08|101.00
SSG 08 | Threat Detected (Factory New)|Mil-Spec|1278|SSG 08|0.07|0.46|159.00
P2000 | Dispatch (Factory New)|Mil-Spec|1279|P2000|0.50|0.07|127.00
SCAR-20 | Magna Carta (Factory New)|Mil-Spec|1280|SCAR-20|0.95|0.16|80.00
FAMAS | Prime Conspiracy (Factory New)|Restricted|1281|FAMAS|0.61|0.22|74.00
Five-SeveN | Berries And Cherries (Factory New)|Restricted|1282|Five-SeveN|0.92|0.14|81.00
UMP-45 | Crime Scene (Factory New)|Restricted|1283|UMP-45|0.95|0.27|123.00
USP-S | Target Acquired (Factory New)|Classified|1284|USP-S|0.94|0.34|126.00
M4A1-S | Blue Phosphor (Factory New)|Classified|1285|M4A1-S|0.59|0.68|95.00
AWP | Fade (Factory New)|Covert|1286|AWP|0.01|0.27|93.00
Dual Berettas | Heist (Factory New)|Consumer Grade|1287|Dual Berettas|0.13|0.14|133.00
Tec-9 | Phoenix Chalk (Factory New)|Consumer Grade|1288|Tec-9|0.04|0.09|87.00
Sawed-Off | Clay Ambush (Factory New)|Consumer Grade|1289|Sawed-Off|0.06|0.35|89.00
M249 | Predator (Factory New)|Consumer Grade|1291|M249|0.10|0.36|98.00
MP7 | Vault Heist (Factory New)|Industrial Grade|1292|MP7|0.12|0.14|95.00
UMP-45 | Houndstooth (Factory New)|Industrial Grade|1293|UMP-45|0.11|0.18|95.00
R8 Revolver | Phoenix Marker (Factory New)|Industrial Grade|1294|R8 Revolver|0.62|0.40|150.00
Nova | Rust Coat (Factory New)|Industrial Grade|1295|Nova|0.56|0.04|80.00
Desert Eagle | Night Heist (Factory New)|Mil-Spec|1296|Desert Eagle|0.67|0.24|66.00
Negev | Phoenix Stencil (Factory New)|Mil-Spec|1297|Negev|0.06|0.28|93.00
P90 | Tiger Pit (Factory New)|Mil-Spec|1298|P90|0.08|0.27|146.00
P250 | Bengal Tiger (Factory New)|Mil-Spec|1299|P250|0.07|0.38|167.00
Galil AR | Phoenix Blacklight (Factory New)|Restricted|1300|Galil AR|0.73|0.41|153.00
SG 553 | Hypnotic (Factory New)|Restricted|1301|SG 553|0.17|0.05|95.00
Glock-18 | Franklin (Factory New)|Restricted|1302|Glock-18|0.17|0.12|137.00
AWP | Silk Tiger (Factory New)|Classified|1303|AWP|0.42|0.13|141.00
MAC-10 | Hot Snakes (Factory New)|Classified|1304|MAC-10|0.08|0.26|94.00
AK-47 | X-Ray (Factory New)|Covert|1305|AK-47|0.04|0.63|154.00
P90 | Ancient Earth (Factory New)|Consumer Grade|1306|P90|0.10|0.28|87.00
Souvenir P90 | Ancient Earth (Factory New)|Consumer Grade|1306|P90|0.10|0.28|87.00
SG 553 | Lush Ruins (Factory New)|Consumer Grade|1307|SG 553|0.17|0.22|95.00
Souvenir SG 553 | Lush Ruins (Factory New)|Consumer Grade|1307|SG 553|0.17|0.22|95.00
Nova | Army Sheen (Factory New)|Consumer Grade|1308|Nova|0.20|0.11|80.00
Souvenir Nova | Army Sheen (Factory New)|Consumer Grade|1308|Nova|0.20|0.11|80.00
SSG 08 | Jungle Dashed (Factory New)|Consumer Grade|1309|SSG 08|0.22|0.19|84.00
Souvenir SSG 08 | Jungle Dashed (Factory New)|Consumer Grade|1309|SSG 08|0.22|0.19|84.00
R8 Revolver | Night (Factory New)|Consumer Grade|1310|R8 Revolver|0.50|0.05|76.00
Souvenir R8 Revolver | Night (Factory New)|Consumer Grade|1310|R8 Revolver|0.50|0.05|76.00
P2000 | Panther Camo (Factory New)|Industrial Grade|1311|P2000|0.39|0.03|103.00
Souvenir P2000 | Panther Camo (Factory New)|Industrial Grade|1311|P2000|0.39|0.03|103.00
MP7 | Tall Grass (Factory New)|Industrial Grade|1312|MP7|0.23|0.54|115.00
Souvenir MP7 | Tall Grass (Factory New)|Industrial Grade|1312|MP7|0.23|0.54|115.00
G3SG1 | Ancient Ritual (Factory New)|Industrial Grade|1313|G3SG1|0.06|0.25|106.00
Souvenir G3SG1 | Ancient Ritual (Factory New)|Industrial Grade|1313|G3SG1|0.06|0.25|106.00
CZ75-Auto | Silver (Factory New)|Industrial Grade|1314|CZ75-Auto|0.15|0.07|122.00
Souvenir CZ75-Auto | Silver (Factory New)|Industrial Grade|1314|CZ75-Auto|0.15|0.07|122.00
Tec-9 | Blast From the Past (Factory New)|Mil-Spec|1315|Tec-9|0.11|0.35|124.00
Souvenir Tec-9 | Blast From the Past (Factory New)|Mil-Spec|1315|Tec-9|0.11|0.35|124.00
AUG | Carved Jade (Factory New)|Mil-Spec|1316|AUG|0.29|0.31|108.00
Souvenir AUG | Carved Jade (Factory New)|Mil-Spec|1316|AUG|0.29|0.31|108.00
Galil AR | Dusk Ruins (Factory New)|Mil-Spec|1317|Galil AR|0.07|0.48|131.00
Souvenir Galil AR | Dusk Ruins (Factory New)|Mil-Spec|1317|Galil AR|0.07|0.48|131.00
XM1014 | Ancient Lore (Factory New)|Restricted|1319|XM1014|0.12|0.22|126.00
Souvenir XM1014 | Ancient Lore (Factory New)|Restricted|1319|XM1014|0.12|0.22|126.00
MAC-10 | Gold Brick (Factory New)|Restricted|1320|MAC-10|0.13|0.24|107.00
Souvenir MAC-10 | Gold Brick (Factory New)|Restricted|1320|MAC-10|0.13|0.24|107.00
USP-S | Ancient Visions (Factory New)|Restricted|1321|USP-S|0.10|0.27|108.00
Souvenir USP-S | Ancient Visions (Factory New)|Restricted|1321|USP-S|0.10|0.27|108.00
P90 | Run and Hide (Factory New)|Classified|1322|P90|0.09|0.45|115.00
Souvenir P90 | Run and Hide (Factory New)|Classified|1322|P90|0.09|0.45|115.00
AK-47 | Panthera onca (Factory New)|Classified|1323|AK-47|0.10|0.47|126.00
Souvenir AK-47 | Panthera onca (Factory New)|Classified|1323|AK-47|0.10|0.47|126.00
M4A1-S | Welcome to the Jungle (Factory New)|Covert|1324|M4A1-S|0.00|0.33|109.00
Souvenir M4A1-S | Welcome to the Jungle (Factory New)|Covert|1324|M4A1-S|0.00|0.33|109.00
Glock-18 | Clear Polymer (Factory New)|Mil-Spec|1325|Glock-18|0.15|0.06|135.00
M249 | O.S.I.P.R. (Factory New)|Mil-Spec|1326|M249|0.56|0.14|76.00
SG 553 | Heavy Metal (Factory New)|Mil-Spec|1327|SG 553|0.11|0.07|85.00
R8 Revolver | Junk Yard (Factory New)|Mil-Spec|1328|R8 Revolver|0.06|0.37|113.00
UMP-45 | Oscillator (Factory New)|Mil-Spec|1329|UMP-45|0.08|0.46|61.00
Nova | Windblown (Factory New)|Mil-Spec|1330|Nova|0.55|0.21|112.00
CZ75-Auto | Circaetus (Factory New)|Mil-Spec|1331|CZ75-Auto|0.05|0.22|90.00
AK-47 | Slate (Factory New)|Restricted|1332|AK-47|0.53|0.08|76.00
P250 | Cyber Shell (Factory New)|Restricted|1333|P250|0.07|0.11|80.00
Negev | dev_texture (Factory New)|Restricted|1334|Negev|0.07|0.47|129.00
MAC-10 | Button Masher (Factory New)|Restricted|1335|MAC-10|0.07|0.12|126.00
Desert Eagle | Trigger Discipline (Factory New)|Restricted|1336|Desert Eagle|0.93|0.20|112.00
MP9 | Food Chain (Factory New)|Classified|1337|MP9|0.06|0.39|122.00
XM1014 | XOXO (Factory New)|Classified|1338|XM1014|0.07|0.29|116.00
Galil AR | Chromatic Aberration (Factory New)|Classified|1339|Galil AR|0.88|0.13|109.00
USP-S | The Traitor (Factory New)|Covert|1340|USP-S|0.02|0.38|74.00
M4A4 | In Living Color (Factory New)|Covert|1341|M4A4|0.14|0.15|133.00
R8 Revolver | Desert Brush (Factory New)|Consumer Grade|1342|R8 Revolver|0.11|0.29|157.00
Souvenir R8 Revolver | Desert Brush (Factory New)|Consumer Grade|1342|R8 Revolver|0.11|0.29|157.00
P90 | Desert DDPAT (Factory New)|Consumer Grade|1343|P90|0.09|0.30|133.00
Souvenir P90 | Desert DDPAT (Factory New)|Consumer Grade|1343|P90|0.09|0.30|133.00
SG 553 | Bleached (Factory New)|Consumer Grade|1344|SG 553|0.09|0.31|123.00
Souvenir SG 553 | Bleached (Factory New)|Consumer Grade|1344|SG 553|0.09|0.31|123.00
MP7 | Prey (Factory New)|Consumer Grade|1345|MP7|0.06|0.16|105.00
Souvenir MP7 | Prey (Factory New)|Consumer Grade|1345|MP7|0.06|0.16|105.00
Sawed-Off | Parched (Factory New)|Consumer Grade|1346|Sawed-Off|0.06|0.07|87.00
Souvenir Sawed-Off | Parched (Factory New)|Consumer Grade|1346|Sawed-Off|0.06|0.07|87.00
AUG | Spalted Wood (Factory New)|Industrial Grade|1347|AUG|0.08|0.25|111.00
Souvenir AUG | Spalted Wood (Factory New)|Industrial Grade|1347|AUG|0.08|0.25|111.00
MP9 | Old Roots (Factory New)|Industrial Grade|1348|MP9|0.15|0.32|100.00
Souvenir MP9 | Old Roots (Factory New)|Industrial Grade|1348|MP9|0.15|0.32|100.00
Five-SeveN | Withered Vine (Factory New)|Industrial Grade|1349|Five-SeveN|0.07|0.20|108.00
Souvenir Five-SeveN | Withered Vine (Factory New)|Industrial Grade|1349|Five-SeveN|0.07|0.20|108.00
M249 | Midnight Palm (Factory New)|Industrial Grade|1350|M249|0.42|0.02|90.00
Souvenir M249 | Midnight Palm (Factory New)|Industrial Grade|1350|M249|0.42|0.02|90.00
P250 | Black & Tan (Factory New)|Mil-Spec|1351|P250|0.10|0.21|135.00
Souvenir P250 | Black & Tan (Factory New)|Mil-Spec|1351|P250|0.10|0.21|135.00
Nova | Quick Sand (Factory New)|Mil-Spec|1352|Nova|0.13|0.19|126.00
Souvenir Nova | Quick Sand (Factory New)|Mil-Spec|1352|Nova|0.13|0.19|126.00
G3SG1 | New Roots (Factory New)|Mil-Spec|1353|G3SG1|0.15|0.27|107.00
Souvenir G3SG1 | New Roots (Factory New)|Mil-Spec|1353|G3SG1|0.15|0.27|107.00
Galil AR | Amber Fade (Factory New)|Mil-Spec|1354|Galil AR|0.14|0.12|90.00
Souvenir Galil AR | Amber Fade (Factory New)|Mil-Spec|1354|Galil AR|0.14|0.12|90.00
USP-S | Orange Anolis (Factory New)|Restricted|1355|USP-S|0.07|0.34|139.00
Souvenir USP-S | Orange Anolis (Factory New)|Restricted|1355|USP-S|0.07|0.34|139.00
M4A4 | Red DDPAT (Factory New)|Restricted|1356|M4A4|0.00|0.36|104.00
Souvenir M4A4 | Red DDPAT (Factory New)|Restricted|1356|M4A4|0.00|0.36|104.00
MAC-10 | Case Hardened (Factory New)|Restricted|1357|MAC-10|0.22|0.06|94.00
Souvenir MAC-10 | Case Hardened (Factory New)|Restricted|1357|MAC-10|0.22|0.06|94.00
UMP-45 | Fade (Factory New)|Classified|1358|UMP-45|0.04|0.31|105.00
Souvenir UMP-45 | Fade (Factory New)|Classified|1358|UMP-45|0.04|0.31|105.00
SSG 08 | Death Strike (Factory New)|Classified|1359|SSG 08|0.09|0.44|126.00
Souvenir SSG 08 | Death Strike (Factory New)|Classified|1359|SSG 08|0.09|0.44|126.00
AK-47 | Gold Arabesque (Factory New)|Covert|1360|AK-47|0.10|0.42|115.00
Souvenir AK-47 | Gold Arabesque (Factory New)|Covert|1360|AK-47|0.10|0.42|115.00
P250 | Drought (Factory New)|Consumer Grade|1361|P250|0.96|0.08|116.00
Souvenir P250 | Drought (Factory New)|Consumer Grade|1361|P250|0.96|0.08|116.00
PP-Bizon | Anolis (Factory New)|Consumer Grade|1362|PP-Bizon|0.18|0.25|81.00
Souvenir PP-Bizon | Anolis (Factory New)|Consumer Grade|1362|PP-Bizon|0.18|0.25|81.00
MAG-7 | Navy Sheen (Factory New)|Consumer Grade|1363|MAG-7|0.60|0.20|98.00
Souvenir MAG-7 | Navy Sheen (Factory New)|Consumer Grade|1363|MAG-7|0.60|0.20|98.00
MAC-10 | Sienna Damask (Factory New)|Consumer Grade|1364|MAC-10|0.11|0.34|121.00
Souvenir MAC-10 | Sienna Damask (Factory New)|Consumer Grade|1364|MAC-10|0.11|0.34|121.00
SSG 08 | Prey (Factory New)|Consumer Grade|1365|SSG 08|0.06|0.14|94.00
Souvenir SSG 08 | Prey (Factory New)|Consumer Grade|1365|SSG 08|0.06|0.14|94.00
Dual Berettas | Drift Wood (Factory New)|Industrial Grade|1366|Dual Berettas|0.08|0.30|86.00
Souvenir Dual Berettas | Drift Wood (Factory New)|Industrial Grade|1366|Dual Berettas|0.08|0.30|86.00
FAMAS | CaliCamo (Factory New)|Industrial Grade|1367|FAMAS|0.09|0.37|134.00
Souvenir FAMAS | CaliCamo (Factory New)|Industrial Grade|1367|FAMAS|0.09|0.37|134.00
CZ75-Auto | Midnight Palm (Factory New)|Industrial Grade|1368|CZ75-Auto|0.33|0.02|96.00
Souvenir CZ75-Auto | Midnight Palm (Factory New)|Industrial Grade|1368|CZ75-Auto|0.33|0.02|96.00
P90 | Verdant Growth (Factory New)|Industrial Grade|1369|P90|0.21|0.27|97.00
Souvenir P90 | Verdant Growth (Factory New)|Industrial Grade|1369|P90|0.21|0.27|97.00
USP-S | Purple DDPAT (Factory New)|Mil-Spec|1370|USP-S|0.73|0.24|91.00
Souvenir USP-S | Purple DDPAT (Factory New)|Mil-Spec|1370|USP-S|0.73|0.24|91.00
MP9 | Music Box (Factory New)|Mil-Spec|1371|MP9|0.09|0.24|96.00
Souvenir MP9 | Music Box (Factory New)|Mil-Spec|1371|MP9|0.09|0.24|96.00
M249 | Humidor (Factory New)|Mil-Spec|1372|M249|0.05|0.29|99.00
Souvenir M249 | Humidor (Factory New)|Mil-Spec|1372|M249|0.05|0.29|99.00
SG 553 | Desert Blossom (Factory New)|Mil-Spec|1373|SG 553|0.04|0.19|112.00
Souvenir SG 553 | Desert Blossom (Factory New)|Mil-Spec|1373|SG 553|0.04|0.19|112.00
XM1014 | Elegant Vines (Factory New)|Restricted|1374|XM1014|0.19|0.12|77.00
Souvenir XM1014 | Elegant Vines (Factory New)|Restricted|1374|XM1014|0.19|0.12|77.00
Glock-18 | Pink DDPAT (Factory New)|Restricted|1375|Glock-18|0.89|0.31|109.00
Souvenir Glock-18 | Pink DDPAT (Factory New)|Restricted|1375|Glock-18|0.89|0.31|109.00
AUG | Sand Storm (Factory New)|Restricted|1376|AUG|0.07|0.31|114.00
Souvenir AUG | Sand Storm (Factory New)|Restricted|1376|AUG|0.07|0.31|114.00
MP5-SD | Oxide Oasis (Factory New)|Classified|1377|MP5-SD|0.08|0.43|133.00
Souvenir MP5-SD | Oxide Oasis (Factory New)|Classified|1377|MP5-SD|0.08|0.43|133.00
Desert Eagle | Fennec Fox (Factory New)|Classified|1378|Desert Eagle|0.06|0.46|99.00
Souvenir Desert Eagle | Fennec Fox (Factory New)|Classified|1378|Desert Eagle|0.06|0.46|99.00
AWP | Desert Hydra (Factory New)|Covert|1379|AWP|0.06|0.40|141.00
Souvenir AWP | Desert Hydra (Factory New)|Covert|1379|AWP|0.06|0.40|141.00
Desert Eagle | Sputnik (Factory New)|Mil-Spec|1380|Desert Eagle|0.57|0.22|106.00
M4A1-S | Fizzy POP (Factory New)|Mil-Spec|1381|M4A1-S|0.11|0.36|141.00
SSG 08 | Spring Twilly (Factory New)|Mil-Spec|1382|SSG 08|0.18|0.29|111.00
AUG | Amber Fade (Factory New)|Mil-Spec|1383|AUG|0.12|0.14|112.00
UMP-45 | Full Stop (Factory New)|Mil-Spec|1384|UMP-45|0.04|0.32|97.00
Tec-9 | Safety Net (Factory New)|Mil-Spec|1385|Tec-9|0.06|0.63|143.00
R8 Revolver | Blaze (Factory New)|Mil-Spec|1386|R8 Revolver|0.06|0.45|104.00
CZ75-Auto | Syndicate (Factory New)|Restricted|1387|CZ75-Auto|0.13|0.46|123.00
AWP | POP AWP (Factory New)|Restricted|1388|AWP|0.89|0.05|114.00
P2000 | Space Race (Factory New)|Restricted|1389|P2000|0.07|0.24|113.00
MP5-SD | Autumn Twilly (Factory New)|Restricted|1390|MP5-SD|0.08|0.36|127.00
Nova | Red Quartz (Factory New)|Restricted|1391|Nova|0.07|0.34|79.00
FAMAS | Meltdown (Factory New)|Classified|1392|FAMAS|0.12|0.49|82.00
MAC-10 | Propaganda (Factory New)|Classified|1393|MAC-10|0.05|0.40|164.00
USP-S | Whiteout (Factory New)|Classified|1394|USP-S|0.15|0.10|168.00
M4A4 | The Coalition (Factory New)|Covert|1396|M4A4|0.14|0.45|102.00
MAC-10 | Strats (Factory New)|Consumer Grade|1397|MAC-10|0.30|0.04|117.00
Souvenir MAC-10 | Strats (Factory New)|Consumer Grade|1397|MAC-10|0.30|0.04|117.00
FAMAS | Faulty Wiring (Factory New)|Consumer Grade|1398|FAMAS|0.15|0.11|111.00
Souvenir FAMAS | Faulty Wiring (Factory New)|Consumer Grade|1398|FAMAS|0.15|0.11|111.00
XM1014 | Blue Tire (Factory New)|Consumer Grade|1399|XM1014|0.42|0.06|98.00
Souvenir XM1014 | Blue Tire (Factory New)|Consumer Grade|1399|XM1014|0.42|0.06|98.00
CZ75-Auto | Framework (Factory New)|Consumer Grade|1400|CZ75-Auto|0.12|0.11|130.00
Souvenir CZ75-Auto | Framework (Factory New)|Consumer Grade|1400|CZ75-Auto|0.12|0.11|130.00
Dual Berettas | Oil Change (Factory New)|Consumer Grade|1401|Dual Berettas|0.10|0.23|71.00
Souvenir Dual Berettas | Oil Change (Factory New)|Consumer Grade|1401|Dual Berettas|0.10|0.23|71.00
Glock-18 | Red Tire (Factory New)|Industrial Grade|1402|Glock-18|0.08|0.11|106.00
Souvenir Glock-18 | Red Tire (Factory New)|Industrial Grade|1402|Glock-18|0.08|0.11|106.00
UMP-45 | Mechanism (Factory New)|Industrial Grade|1403|UMP-45|0.11|0.16|100.00
Souvenir UMP-45 | Mechanism (Factory New)|Industrial Grade|1403|UMP-45|0.11|0.16|100.00
SSG 08 | Carbon Fiber (Factory New)|Industrial Grade|1404|SSG 08|0.25|0.04|96.00
Souvenir SSG 08 | Carbon Fiber (Factory New)|Industrial Grade|1404|SSG 08|0.25|0.04|96.00
PP-Bizon | Breaker Box (Factory New)|Industrial Grade|1405|PP-Bizon|0.05|0.11|90.00
Souvenir PP-Bizon | Breaker Box (Factory New)|Industrial Grade|1405|PP-Bizon|0.05|0.11|90.00
AK-47 | Green Laminate (Factory New)|Mil-Spec|1406|AK-47|0.25|0.24|100.00
Souvenir AK-47 | Green Laminate (Factory New)|Mil-Spec|1406|AK-47|0.25|0.24|100.00
P90 | Schematic (Factory New)|Mil-Spec|1407|P90|0.17|0.05|137.00
Souvenir P90 | Schematic (Factory New)|Mil-Spec|1407|P90|0.17|0.05|137.00
Nova | Interlock (Factory New)|Mil-Spec|1408|Nova|0.14|0.33|118.00
Souvenir Nova | Interlock (Factory New)|Mil-Spec|1408|Nova|0.14|0.33|118.00
Negev | Infrastructure (Factory New)|Mil-Spec|1409|Negev|0.08|0.36|109.00
Souvenir Negev | Infrastructure (Factory New)|Mil-Spec|1409|Negev|0.08|0.36|109.00
Galil AR | CAUTION! (Factory New)|Restricted|1410|Galil AR|0.13|0.53|141.00
Souvenir Galil AR | CAUTION! (Factory New)|Restricted|1410|Galil AR|0.13|0.53|141.00
MAG-7 | Prism Terrace (Factory New)|Restricted|1411|MAG-7|0.20|0.14|112.00
Souvenir MAG-7 | Prism Terrace (Factory New)|Restricted|1411|MAG-7|0.20|0.14|112.00
P250 | Digital Architect (Factory New)|Restricted|1412|P250|0.62|0.22|135.00
Souvenir P250 | Digital Architect (Factory New)|Restricted|1412|P250|0.62|0.22|135.00
Five-SeveN | Fall Hazard (Factory New)|Classified|1413|Five-SeveN|0.39|0.18|122.00
Souvenir Five-SeveN | Fall Hazard (Factory New)|Classified|1413|Five-SeveN|0.39|0.18|122.00
SG 553 | Hazard Pay (Factory New)|Classified|1414|SG 553|0.12|0.63|134.00
Souvenir SG 553 | Hazard Pay (Factory New)|Classified|1414|SG 553|0.12|0.63|134.00
M4A1-S | Imminent Danger (Factory New)|Covert|1415|M4A1-S|0.12|0.10|80.00
Souvenir M4A1-S | Imminent Danger (Factory New)|Covert|1415|M4A1-S|0.12|0.10|80.00
AUG | Plague (Factory New)|Mil-Spec|1416|AUG|0.10|0.11|92.00
Dual Berettas | Tread (Factory New)|Mil-Spec|1417|Dual Berettas|0.10|0.15|97.00
G3SG1 | Keeping Tabs (Factory New)|Mil-Spec|1418|G3SG1|0.08|0.21|89.00
MP7 | Guerrilla (Factory New)|Mil-Spec|1419|MP7|0.12|0.23|87.00
PP-Bizon | Lumen (Factory New)|Mil-Spec|1420|PP-Bizon|0.08|0.02|88.00
USP-S | Black Lotus (Factory New)|Mil-Spec|1421|USP-S|0.61|0.09|104.00
XM1014 | Watchdog (Factory New)|Mil-Spec|1422|XM1014|0.18|0.18|91.00
MAG-7 | BI83 Spectrum (Factory New)|Restricted|1423|MAG-7|0.42|0.03|60.00
FAMAS | ZX Spectron (Factory New)|Restricted|1424|FAMAS|0.06|0.29|89.00
Five-SeveN | Boost Protocol (Factory New)|Restricted|1425|Five-SeveN|0.01|0.21|132.00
MP9 | Mount Fuji (Factory New)|Restricted|1426|MP9|0.77|0.09|123.00
M4A4 | Spider Lily (Factory New)|Restricted|1427|M4A4|0.50|0.01|77.00
MAC-10 | Toybox (Factory New)|Classified|1428|MAC-10|0.12|0.23|133.00
Glock-18 | Snack Attack (Factory New)|Classified|1429|Glock-18|0.07|0.39|132.00
SSG 08 | Turbo Peek (Factory New)|Classified|1430|SSG 08|0.93|0.30|108.00
Desert Eagle | Ocean Drive (Factory New)|Covert|1431|Desert Eagle|0.93|0.36|116.00
AK-47 | Leet Museo (Factory New)|Covert|1432|AK-47|0.14|0.12|89.00
★ Bowie Knife | Freehand (Factory New)|Covert|1434|Bowie Knife|0.70|0.14|139.00
★ Bowie Knife | Lore (Factory New)|Covert|1435|Bowie Knife|0.13|0.48|149.00
★ Bowie Knife | Autotronic (Factory New)|Covert|1436|Bowie Knife|0.01|0.21|141.00
★ Bowie Knife | Black Laminate (Factory New)|Covert|1437|Bowie Knife|0.17|0.05|129.00
★ Bowie Knife | Bright Water (Factory New)|Covert|1438|Bowie Knife|0.60|0.38|127.00
★ Butterfly Knife | Freehand (Factory New)|Covert|1440|Butterfly Knife|0.69|0.15|124.00
★ Butterfly Knife | Lore (Factory New)|Covert|1441|Butterfly Knife|0.12|0.50|141.00
★ Butterfly Knife | Autotronic (Factory New)|Covert|1442|Butterfly Knife|0.83|0.01|86.00
★ Butterfly Knife | Black Laminate (Factory New)|Covert|1443|Butterfly Knife|0.46|0.04|110.00
★ Butterfly Knife | Bright Water (Factory New)|Covert|1444|Butterfly Knife|0.59|0.35|106.00
★ Falchion Knife | Freehand (Factory New)|Covert|1446|Falchion Knife|0.72|0.10|145.00
★ Falchion Knife | Lore (Factory New)|Covert|1447|Falchion Knife|0.14|0.41|155.00
★ Falchion Knife | Autotronic (Factory New)|Covert|1448|Falchion Knife|0.00|0.14|145.00
★ Falchion Knife | Black Laminate (Factory New)|Covert|1449|Falchion Knife|0.19|0.05|130.00
★ Falchion Knife | Bright Water (Factory New)|Covert|1450|Falchion Knife|0.59|0.33|130.00
★ Huntsman Knife | Freehand (Factory New)|Covert|1452|Huntsman Knife|0.69|0.14|142.00
★ Huntsman Knife | Lore (Factory New)|Covert|1453|Huntsman Knife|0.13|0.50|149.00
★ Huntsman Knife | Autotronic (Factory New)|Covert|1454|Huntsman Knife|0.97|0.29|149.00
★ Huntsman Knife | Black Laminate (Factory New)|Covert|1455|Huntsman Knife|0.19|0.05|135.00
★ Huntsman Knife | Bright Water (Factory New)|Covert|1456|Huntsman Knife|0.60|0.33|122.00
★ Shadow Daggers | Freehand (Factory New)|Covert|1458|Shadow Daggers|0.70|0.14|157.00
★ Shadow Daggers | Lore (Factory New)|Covert|1459|Shadow Daggers|0.12|0.50|184.00
★ Shadow Daggers | Autotronic (Factory New)|Covert|1460|Shadow Daggers|0.98|0.26|157.00
★ Shadow Daggers | Black Laminate (Factory New)|Covert|1461|Shadow Daggers|0.19|0.04|140.00
★ Shadow Daggers | Bright Water (Factory New)|Covert|1462|Shadow Daggers|0.60|0.31|124.00
Five-SeveN | Scrawl (Factory New)|Mil-Spec|1463|Five-SeveN|0.15|0.22|133.00
MAC-10 | Ensnared (Factory New)|Mil-Spec|1464|MAC-10|0.19|0.07|124.00
MAG-7 | Foresight (Factory New)|Mil-Spec|1465|MAG-7|0.06|0.06|51.00
MP5-SD | Necro Jr. (Factory New)|Mil-Spec|1466|MP5-SD|0.08|0.18|116.00
P2000 | Lifted Spirits (Factory New)|Mil-Spec|1467|P2000|0.09|0.21|128.00
SCAR-20 | Poultrygeist (Factory New)|Mil-Spec|1468|SCAR-20|0.89|0.12|74.00
Sawed-Off | Spirit Board (Factory New)|Mil-Spec|1469|Sawed-Off|0.09|0.34|121.00
PP-Bizon | Space Cat (Factory New)|Restricted|1470|PP-Bizon|0.78|0.14|120.00
G3SG1 | Dream Glade (Factory New)|Restricted|1471|G3SG1|0.41|0.26|99.00
M4A1-S | Night Terror (Factory New)|Restricted|1472|M4A1-S|0.04|0.23|71.00
XM1014 | Zombie Offensive (Factory New)|Restricted|1473|XM1014|0.10|0.24|98.00
USP-S | Ticket to Hell (Factory New)|Restricted|1474|USP-S|0.15|0.07|112.00
Dual Berettas | Melondrama (Factory New)|Classified|1475|Dual Berettas|0.95|0.17|105.00
FAMAS | Rapid Eye Movement (Factory New)|Classified|1476|FAMAS|0.89|0.29|76.00
MP7 | Abyssal Apparition (Factory New)|Classified|1477|MP7|0.10|0.45|126.00
AK-47 | Nightwish (Factory New)|Covert|1478|AK-47|0.93|0.16|101.00
MP9 | Starlight Protector (Factory New)|Covert|1479|MP9|0.08|0.26|123.00
FAMAS | Meow 36 (Factory New)|Mil-Spec|1480|FAMAS|0.24|0.24|107.00
Galil AR | Destroyer (Factory New)|Mil-Spec|1481|Galil AR|0.19|0.09|79.00
M4A4 | Poly Mag (Factory New)|Mil-Spec|1482|M4A4|0.08|0.37|134.00
MAC-10 | Monkeyflage (Factory New)|Mil-Spec|1483|MAC-10|0.11|0.26|130.00
Negev | Drop Me (Factory New)|Mil-Spec|1484|Negev|0.08|0.34|119.00
UMP-45 | Roadblock (Factory New)|Mil-Spec|1485|UMP-45|0.10|0.06|79.00
Glock-18 | Winterized (Factory New)|Mil-Spec|1486|Glock-18|0.14|0.14|110.00
R8 Revolver | Crazy 8 (Factory New)|Restricted|1487|R8 Revolver|0.73|0.23|114.00
M249 | Downtown (Factory New)|Restricted|1488|M249|0.68|0.29|134.00
SG 553 | Dragon Tech (Factory New)|Restricted|1489|SG 553|0.40|0.24|111.00
P90 | Vent Rush (Factory New)|Restricted|1490|P90|0.04|0.18|97.00
Dual Berettas | Flora Carnivora (Factory New)|Restricted|1491|Dual Berettas|0.73|0.15|107.00
AK-47 | Ice Coaled (Factory New)|Classified|1492|AK-47|0.49|0.51|103.00
P250 | Visions (Factory New)|Classified|1493|P250|0.23|0.18|72.00
Sawed-Off | Kiss♥Love (Factory New)|Classified|1494|Sawed-Off|0.83|0.24|107.00
USP-S | Printstream (Factory New)|Covert|1495|USP-S|0.13|0.06|148.00
AWP | Chromatic Aberration (Factory New)|Covert|1496|AWP|0.83|0.34|92.00
MAG-7 | Insomnia (Factory New)|Mil-Spec|1497|MAG-7|0.03|0.52|122.00
MP9 | Featherweight (Factory New)|Mil-Spec|1498|MP9|0.20|0.05|110.00
SCAR-20 | Fragments (Factory New)|Mil-Spec|1499|SCAR-20|0.10|0.16|94.00
P250 | Re.built (Factory New)|Mil-Spec|1500|P250|0.11|0.07|131.00
MP5-SD | Liquidation (Factory New)|Mil-Spec|1501|MP5-SD|0.62|0.26|104.00
SG 553 | Cyberforce (Factory New)|Mil-Spec|1502|SG 553|0.05|0.19|117.00
Tec-9 | Rebel (Factory New)|Mil-Spec|1503|Tec-9|0.12|0.22|118.00
M4A1-S | Emphorosaur-S (Factory New)|Restricted|1504|M4A1-S|0.24|0.48|115.00
Glock-18 | Umbral Rabbit (Factory New)|Restricted|1505|Glock-18|0.08|0.41|158.00
R8 Revolver | Banana Cannon (Factory New)|Restricted|1507|R8 Revolver|0.13|0.57|135.00
P90 | Neoqueen (Factory New)|Restricted|1508|P90|0.05|0.16|103.00
UMP-45 | Wild Child (Factory New)|Classified|1509|UMP-45|0.05|0.13|131.00
P2000 | Wicked Sick (Factory New)|Classified|1510|P2000|0.85|0.17|128.00
AK-47 | Head Shot (Factory New)|Covert|1511|AK-47|0.13|0.22|124.00
M4A4 | Temukau (Factory New)|Covert|1512|M4A4|0.61|0.13|169.00
AWP | Duality (Factory New)|Classified|1513|AWP|0.06|0.17|80.00
R8 Revolver | Inlay (Factory New)|Consumer Grade|1514|R8 Revolver|0.11|0.20|130.00
Souvenir R8 Revolver | Inlay (Factory New)|Consumer Grade|1514|R8 Revolver|0.11|0.20|130.00
M249 | Submerged (Factory New)|Consumer Grade|1515|M249|0.11|0.17|92.00
Souvenir M249 | Submerged (Factory New)|Consumer Grade|1515|M249|0.11|0.17|92.00
XM1014 | Hieroglyph (Factory New)|Consumer Grade|1516|XM1014|0.08|0.29|149.00
Souvenir XM1014 | Hieroglyph (Factory New)|Consumer Grade|1516|XM1014|0.08|0.29|149.00
MP7 | Sunbaked (Factory New)|Consumer Grade|1517|MP7|0.09|0.15|97.00
Souvenir MP7 | Sunbaked (Factory New)|Consumer Grade|1517|MP7|0.09|0.15|97.00
AUG | Snake Pit (Factory New)|Consumer Grade|1518|AUG|0.10|0.25|110.00
Souvenir AUG | Snake Pit (Factory New)|Consumer Grade|1518|AUG|0.10|0.25|110.00
M4A1-S | Mud-Spec (Factory New)|Industrial Grade|1519|M4A1-S|0.15|0.11|74.00
Souvenir M4A1-S | Mud-Spec (Factory New)|Industrial Grade|1519|M4A1-S|0.15|0.11|74.00
SSG 08 | Azure Glyph (Factory New)|Industrial Grade|1520|SSG 08|0.19|0.10|71.00
Souvenir SSG 08 | Azure Glyph (Factory New)|Industrial Grade|1520|SSG 08|0.19|0.10|71.00
MAC-10 | Echoing Sands (Factory New)|Industrial Grade|1521|MAC-10|0.11|0.24|140.00
Souvenir MAC-10 | Echoing Sands (Factory New)|Industrial Grade|1521|MAC-10|0.11|0.24|140.00
USP-S | Desert Tactical (Factory New)|Industrial Grade|1522|USP-S|0.10|0.20|97.00
Souvenir USP-S | Desert Tactical (Factory New)|Industrial Grade|1522|USP-S|0.10|0.20|97.00
AK-47 | Steel Delta (Factory New)|Mil-Spec|1523|AK-47|0.10|0.09|74.00
Souvenir AK-47 | Steel Delta (Factory New)|Mil-Spec|1523|AK-47|0.10|0.09|74.00
AWP | Black Nile (Factory New)|Mil-Spec|1524|AWP|0.13|0.15|92.00
Souvenir AWP | Black Nile (Factory New)|Mil-Spec|1524|AWP|0.13|0.15|92.00
Tec-9 | Mummy's Rot (Factory New)|Mil-Spec|1525|Tec-9|0.10|0.35|100.00
Souvenir Tec-9 | Mummy's Rot (Factory New)|Mil-Spec|1525|Tec-9|0.10|0.35|100.00
MAG-7 | Copper Coated (Factory New)|Mil-Spec|1526|MAG-7|0.11|0.13|84.00
Souvenir MAG-7 | Copper Coated (Factory New)|Mil-Spec|1526|MAG-7|0.11|0.13|84.00
Glock-18 | Ramese's Reach (Factory New)|Restricted|1527|Glock-18|0.10|0.53|135.00
Souvenir Glock-18 | Ramese's Reach (Factory New)|Restricted|1527|Glock-18|0.10|0.53|135.00
Nova | Sobek's Bite (Factory New)|Restricted|1528|Nova|0.11|0.25|59.00
Souvenir Nova | Sobek's Bite (Factory New)|Restricted|1528|Nova|0.11|0.25|59.00
P90 | ScaraB Rush (Factory New)|Restricted|1529|P90|0.11|0.37|127.00
Souvenir P90 | ScaraB Rush (Factory New)|Restricted|1529|P90|0.11|0.37|127.00
FAMAS | Waters of Nephthys (Factory New)|Classified|1530|FAMAS|0.47|0.35|133.00
Souvenir FAMAS | Waters of Nephthys (Factory New)|Classified|1530|FAMAS|0.47|0.35|133.00
P250 | Apep's Curse (Factory New)|Classified|1531|P250|0.10|0.43|97.00
Souvenir P250 | Apep's Curse (Factory New)|Classified|1531|P250|0.10|0.43|97.00
M4A4 | Eye of Horus (Factory New)|Covert|1532|M4A4|0.14|0.33|89.00
Souvenir M4A4 | Eye of Horus (Factory New)|Covert|1532|M4A4|0.14|0.33|89.00
Tec-9 | Slag (Factory New)|Mil-Spec|1533|Tec-9|0.09|0.12|122.00
XM1014 | Irezumi (Factory New)|Mil-Spec|1534|XM1014|0.12|0.19|104.00
UMP-45 | Motorized (Factory New)|Mil-Spec|1535|UMP-45|0.10|0.07|109.00
SSG 08 | Dezastre (Factory New)|Mil-Spec|1536|SSG 08|0.33|0.02|98.00
Dual Berettas | Hideout (Factory New)|Mil-Spec|1537|Dual Berettas|0.07|0.22|108.00
Nova | Dark Sigil (Factory New)|Mil-Spec|1538|Nova|0.08|0.27|93.00
MAC-10 | Light Box (Factory New)|Mil-Spec|1539|MAC-10|0.65|0.08|112.00
Glock-18 | Block-18 (Factory New)|Restricted|1540|Glock-18|0.10|0.15|142.00
M4A4 | Etch Lord (Factory New)|Restricted|1541|M4A4|0.10|0.10|80.00
MP7 | Just Smile (Factory New)|Restricted|1542|MP7|0.26|0.06|115.00
Sawed-Off | Analog Input (Factory New)|Restricted|1543|Sawed-Off|0.08|0.31|110.00
Five-SeveN | Hybrid (Factory New)|Restricted|1544|Five-SeveN|0.78|0.24|94.00
M4A1-S | Black Lotus (Factory New)|Classified|1545|M4A1-S|0.71|0.18|71.00
Zeus x27 | Olympus (Factory New)|Classified|1546|Zeus x27|0.59|0.17|120.00
USP-S | Jawbreaker (Factory New)|Classified|1547|USP-S|0.00|0.07|83.00
AWP | Chrome Cannon (Factory New)|Covert|1548|AWP|0.02|0.11|81.00
AK-47 | Inheritance (Factory New)|Covert|1549|AK-47|0.12|0.03|120.00
★ Kukri Knife | Forest DDPAT (Factory New)|Covert|1550|Kukri Knife|0.20|0.21|130.00
★ Kukri Knife | Fade (Factory New)|Covert|1552|Kukri Knife|0.02|0.37|127.00
★ Kukri Knife | Blue Steel (Factory New)|Covert|1553|Kukri Knife|0.58|0.17|93.00
★ Kukri Knife | Stained (Factory New)|Covert|1554|Kukri Knife|0.56|0.09|118.00
★ Kukri Knife | Case Hardened (Factory New)|Covert|1555|Kukri Knife|0.67|0.08|123.00
★ Kukri Knife | Slaughter (Factory New)|Covert|1556|Kukri Knife|0.00|0.36|132.00
★ Kukri Knife | Safari Mesh (Factory New)|Covert|1557|Kukri Knife|0.17|0.16|129.00
★ Kukri Knife | Boreal Forest (Factory New)|Covert|1558|Kukri Knife|0.18|0.18|122.00
★ Kukri Knife | Urban Masked (Factory New)|Covert|1559|Kukri Knife|0.38|0.02|165.00
★ Kukri Knife | Scorched (Factory New)|Covert|1560|Kukri Knife|0.11|0.07|124.00
★ Kukri Knife | Night Stripe (Factory New)|Covert|1561|Kukri Knife|0.55|0.17|95.00
★ Kukri Knife | Vanilla (Factory New)|Covert|1562|Kukri Knife|0.28|0.03|93.00`;

const WEIGHTED_RAW = `UMP-45 | Caramel (Factory New)|Consumer Grade|1|UMP-45|0.11|0.31|108.00
AUG | Hot Rod (Factory New)|Mil-Spec|2|AUG|0.02|0.30|86.00
Glock-18 | Fade (Factory New)|Restricted|3|Glock-18|0.04|0.21|72.00
MP9 | Bulldozer (Factory New)|Restricted|4|MP9|0.15|0.62|188.00
SG 553 | Tornado (Factory New)|Consumer Grade|5|SG 553|0.58|0.06|104.00
Negev | Anodized Navy (Factory New)|Mil-Spec|6|Negev|0.17|0.03|71.00
Five-SeveN | Candy Apple (Factory New)|Industrial Grade|7|Five-SeveN|0.01|0.50|133.00
FAMAS | Contrast Spray (Factory New)|Consumer Grade|8|FAMAS|0.12|0.10|134.00
M249 | Blizzard Marbleized (Factory New)|Industrial Grade|9|M249|0.19|0.04|145.00
MP7 | Whiteout (Factory New)|Mil-Spec|10|MP7|0.15|0.09|200.00
P2000 | Silver (Factory New)|Mil-Spec|11|P2000|0.17|0.05|113.00
G3SG1 | Arctic Camo (Factory New)|Industrial Grade|12|G3SG1|0.20|0.05|107.00
Galil AR | Winter Forest (Factory New)|Industrial Grade|13|Galil AR|0.17|0.04|145.00
XM1014 | Fallout Warning (Factory New)|Industrial Grade|14|XM1014|0.99|0.30|86.00
Souvenir XM1014 | Fallout Warning (Factory New)|Industrial Grade|14|XM1014|0.99|0.30|86.00
M4A4 | Radiation Hazard (Factory New)|Mil-Spec|15|M4A4|0.02|0.47|101.00
Souvenir M4A4 | Radiation Hazard (Factory New)|Mil-Spec|15|M4A4|0.02|0.47|101.00
UMP-45 | Fallout Warning (Factory New)|Industrial Grade|16|UMP-45|0.02|0.20|88.00
Souvenir UMP-45 | Fallout Warning (Factory New)|Industrial Grade|16|UMP-45|0.02|0.20|88.00
PP-Bizon | Irradiated Alert (Factory New)|Consumer Grade|17|PP-Bizon|0.09|0.28|80.00
Souvenir PP-Bizon | Irradiated Alert (Factory New)|Consumer Grade|17|PP-Bizon|0.09|0.28|80.00
P90 | Fallout Warning (Factory New)|Industrial Grade|18|P90|0.01|0.24|86.00
Souvenir P90 | Fallout Warning (Factory New)|Industrial Grade|18|P90|0.01|0.24|86.00
Tec-9 | Nuclear Threat (Factory New)|Restricted|19|Tec-9|0.29|0.46|108.00
Souvenir Tec-9 | Nuclear Threat (Factory New)|Restricted|19|Tec-9|0.29|0.46|108.00
P250 | Nuclear Threat (Factory New)|Restricted|20|P250|0.29|0.45|110.00
Souvenir P250 | Nuclear Threat (Factory New)|Restricted|20|P250|0.29|0.45|110.00
Sawed-Off | Irradiated Alert (Factory New)|Consumer Grade|21|Sawed-Off|0.08|0.34|77.00
Souvenir Sawed-Off | Irradiated Alert (Factory New)|Consumer Grade|21|Sawed-Off|0.08|0.34|77.00
MAG-7 | Irradiated Alert (Factory New)|Consumer Grade|22|MAG-7|0.09|0.26|77.00
Souvenir MAG-7 | Irradiated Alert (Factory New)|Consumer Grade|22|MAG-7|0.09|0.26|77.00
SCAR-20 | Splash Jam (Factory New)|Classified|23|SCAR-20|0.94|0.25|79.00
Nova | Modern Hunter (Factory New)|Mil-Spec|24|Nova|0.12|0.19|104.00
PP-Bizon | Forest Leaves (Factory New)|Consumer Grade|25|PP-Bizon|0.14|0.41|81.00
PP-Bizon | Modern Hunter (Factory New)|Mil-Spec|26|PP-Bizon|0.13|0.22|118.00
XM1014 | Blaze Orange (Factory New)|Mil-Spec|27|XM1014|0.05|0.62|143.00
P250 | Modern Hunter (Factory New)|Mil-Spec|28|P250|0.13|0.24|143.00
MAC-10 | Tornado (Factory New)|Consumer Grade|29|MAC-10|0.33|0.01|129.00
Nova | Blaze Orange (Factory New)|Mil-Spec|30|Nova|0.06|0.55|109.00
XM1014 | Grassland (Factory New)|Consumer Grade|31|XM1014|0.12|0.28|156.00
P2000 | Grassland Leaves (Factory New)|Industrial Grade|32|P2000|0.13|0.28|117.00
M4A4 | Modern Hunter (Factory New)|Restricted|33|M4A4|0.14|0.18|122.00
Nova | Walnut (Factory New)|Consumer Grade|34|Nova|0.07|0.24|83.00
Souvenir Nova | Walnut (Factory New)|Consumer Grade|34|Nova|0.07|0.24|83.00
M4A4 | Tornado (Factory New)|Industrial Grade|35|M4A4|0.13|0.04|128.00
Souvenir M4A4 | Tornado (Factory New)|Industrial Grade|35|M4A4|0.13|0.04|128.00
Tec-9 | Brass (Factory New)|Mil-Spec|36|Tec-9|0.17|0.16|70.00
Souvenir Tec-9 | Brass (Factory New)|Mil-Spec|36|Tec-9|0.17|0.16|70.00
P250 | Gunsmoke (Factory New)|Industrial Grade|37|P250|0.09|0.19|144.00
Souvenir P250 | Gunsmoke (Factory New)|Industrial Grade|37|P250|0.09|0.19|144.00
Dual Berettas | Anodized Navy (Factory New)|Mil-Spec|38|Dual Berettas|0.58|0.22|69.00
Souvenir Dual Berettas | Anodized Navy (Factory New)|Mil-Spec|38|Dual Berettas|0.58|0.22|69.00
MAG-7 | Sand Dune (Factory New)|Consumer Grade|39|MAG-7|0.12|0.28|184.00
Souvenir MAG-7 | Sand Dune (Factory New)|Consumer Grade|39|MAG-7|0.12|0.28|184.00
AK-47 | Black Laminate (Factory New)|Mil-Spec|40|AK-47|0.12|0.11|75.00
Souvenir AK-47 | Black Laminate (Factory New)|Mil-Spec|40|AK-47|0.12|0.11|75.00
PP-Bizon | Carbon Fiber (Factory New)|Industrial Grade|41|PP-Bizon|0.17|0.03|63.00
Souvenir PP-Bizon | Carbon Fiber (Factory New)|Industrial Grade|41|PP-Bizon|0.17|0.03|63.00
MAC-10 | Urban DDPAT (Factory New)|Consumer Grade|42|MAC-10|0.13|0.10|127.00
Souvenir MAC-10 | Urban DDPAT (Factory New)|Consumer Grade|42|MAC-10|0.13|0.10|127.00
P90 | Glacier Mesh (Factory New)|Mil-Spec|43|P90|0.44|0.06|149.00
Souvenir P90 | Glacier Mesh (Factory New)|Mil-Spec|43|P90|0.44|0.06|149.00
XM1014 | Urban Perforated (Factory New)|Consumer Grade|45|XM1014|0.17|0.06|99.00
Souvenir XM1014 | Urban Perforated (Factory New)|Consumer Grade|45|XM1014|0.17|0.06|99.00
M4A4 | Jungle Tiger (Factory New)|Industrial Grade|46|M4A4|0.14|0.13|83.00
SSG 08 | Lichen Dashed (Factory New)|Consumer Grade|47|SSG 08|0.18|0.21|77.00
Five-SeveN | Jungle (Factory New)|Consumer Grade|48|Five-SeveN|0.21|0.36|158.00
Tec-9 | Ossified (Factory New)|Mil-Spec|49|Tec-9|0.20|0.14|65.00
Nova | Forest Leaves (Factory New)|Consumer Grade|50|Nova|0.16|0.41|74.00
AK-47 | Jungle Spray (Factory New)|Industrial Grade|51|AK-47|0.19|0.29|84.00
AK-47 | Predator (Factory New)|Industrial Grade|52|AK-47|0.10|0.40|80.00
SCAR-20 | Palm (Factory New)|Industrial Grade|53|SCAR-20|0.12|0.27|123.00
Sawed-Off | Copper (Factory New)|Mil-Spec|54|Sawed-Off|0.06|0.43|91.00
M4A4 | Desert Storm (Factory New)|Industrial Grade|55|M4A4|0.08|0.32|122.00
Glock-18 | Brass (Factory New)|Restricted|57|Glock-18|0.14|0.21|71.00
P2000 | Scorpion (Factory New)|Restricted|58|P2000|0.08|0.29|75.00
Desert Eagle | Blaze (Factory New)|Restricted|59|Desert Eagle|0.07|0.56|72.00
AWP | Snake Camo (Factory New)|Mil-Spec|60|AWP|0.11|0.25|97.00
AWP | BOOM (Factory New)|Classified|62|AWP|0.04|0.52|127.00
MAG-7 | Memento (Factory New)|Mil-Spec|63|MAG-7|0.09|0.23|66.00
Galil AR | Orange DDPAT (Factory New)|Restricted|64|Galil AR|0.09|0.33|93.00
P250 | Splash (Factory New)|Restricted|66|P250|0.08|0.45|97.00
Sawed-Off | Orange DDPAT (Factory New)|Restricted|67|Sawed-Off|0.10|0.32|76.00
M4A4 | Faded Zebra (Factory New)|Mil-Spec|68|M4A4|0.13|0.11|94.00
AK-47 | Red Laminate (Factory New)|Classified|69|AK-47|0.03|0.34|90.00
AWP | Lightning Strike (Factory New)|Covert|70|AWP|0.78|0.23|74.00
AUG | Wings (Factory New)|Mil-Spec|71|AUG|0.12|0.09|79.00
SG 553 | Ultraviolet (Factory New)|Mil-Spec|72|SG 553|0.77|0.35|72.00
AK-47 | Case Hardened (Factory New)|Classified|73|AK-47|0.05|0.25|77.00
Desert Eagle | Hypnotic (Factory New)|Classified|74|Desert Eagle|0.10|0.09|76.00
Glock-18 | Dragon Tattoo (Factory New)|Restricted|75|Glock-18|0.17|0.06|69.00
SCAR-20 | Emerald (Factory New)|Restricted|79|SCAR-20|0.37|0.24|59.00
MP7 | Groundwater (Factory New)|Consumer Grade|80|MP7|0.20|0.24|153.00
AUG | Anodized Navy (Factory New)|Mil-Spec|81|AUG|0.56|0.08|77.00
FAMAS | Spitfire (Factory New)|Restricted|82|FAMAS|0.12|0.33|97.00
PP-Bizon | Rust Coat (Factory New)|Mil-Spec|83|PP-Bizon|0.17|0.01|72.00
XM1014 | Jungle (Factory New)|Consumer Grade|84|XM1014|0.24|0.27|131.00
Five-SeveN | Anodized Gunmetal (Factory New)|Consumer Grade|85|Five-SeveN|0.14|0.09|68.00
P250 | Facets (Factory New)|Industrial Grade|86|P250|0.14|0.08|91.00
MP9 | Dry Season (Factory New)|Consumer Grade|87|MP9|0.12|0.37|115.00
Sawed-Off | Mosaico (Factory New)|Industrial Grade|88|Sawed-Off|0.11|0.35|99.00
MAG-7 | Hazard (Factory New)|Mil-Spec|89|MAG-7|0.13|0.56|110.00
Negev | Palm (Factory New)|Industrial Grade|90|Negev|0.12|0.28|140.00
Tec-9 | Tornado (Factory New)|Consumer Grade|91|Tec-9|0.57|0.06|121.00
M249 | Jungle DDPAT (Factory New)|Consumer Grade|92|M249|0.15|0.28|81.00
SSG 08 | Mayan Dreams (Factory New)|Industrial Grade|93|SSG 08|0.10|0.26|81.00
Glock-18 | Sand Dune (Factory New)|Industrial Grade|94|Glock-18|0.11|0.28|173.00
USP-S | Overgrowth (Factory New)|Restricted|95|USP-S|0.20|0.43|127.00
AWP | Graphite (Factory New)|Classified|96|AWP|0.17|0.04|55.00
G3SG1 | Demeter (Factory New)|Mil-Spec|97|G3SG1|0.47|0.07|71.00
Galil AR | Shattered (Factory New)|Mil-Spec|98|Galil AR|0.12|0.07|123.00
SG 553 | Wave Spray (Factory New)|Mil-Spec|99|SG 553|0.55|0.19|103.00
AK-47 | Fire Serpent (Factory New)|Covert|100|AK-47|0.11|0.22|85.00
UMP-45 | Bone Pile (Factory New)|Mil-Spec|101|UMP-45|0.20|0.25|91.00
MAC-10 | Graven (Factory New)|Restricted|102|MAC-10|0.18|0.26|102.00
P2000 | Ocean Foam (Factory New)|Classified|103|P2000|0.55|0.08|85.00
Dual Berettas | Black Limba (Factory New)|Mil-Spec|104|Dual Berettas|0.09|0.24|80.00
M4A4 | Zirka (Factory New)|Restricted|105|M4A4|0.12|0.26|77.00
Desert Eagle | Golden Koi (Factory New)|Covert|106|Desert Eagle|0.16|0.15|119.00
P90 | Emerald Dragon (Factory New)|Classified|107|P90|0.19|0.17|95.00
Nova | Tempest (Factory New)|Mil-Spec|108|Nova|0.61|0.38|84.00
SSG 08 | Blood in the Water (Factory New)|Covert|110|SSG 08|0.13|0.07|69.00
USP-S | Serum (Factory New)|Classified|111|USP-S|0.07|0.28|54.00
M4A1-S | Blood Tiger (Factory New)|Mil-Spec|112|M4A1-S|0.07|0.26|72.00
MP9 | Hypnotic (Factory New)|Restricted|113|MP9|0.10|0.10|71.00
P90 | Cold Blooded (Factory New)|Classified|114|P90|0.01|0.45|82.00
Dual Berettas | Hemoglobin (Factory New)|Restricted|115|Dual Berettas|0.02|0.49|85.00
P250 | Hive (Factory New)|Mil-Spec|116|P250|0.04|0.60|81.00
Five-SeveN | Case Hardened (Factory New)|Restricted|117|Five-SeveN|0.25|0.05|74.00
FAMAS | Hexane (Factory New)|Mil-Spec|118|FAMAS|0.61|0.22|69.00
Tec-9 | Blue Titanium (Factory New)|Mil-Spec|119|Tec-9|0.50|0.06|71.00
Nova | Graphite (Factory New)|Restricted|120|Nova|0.42|0.05|44.00
SCAR-20 | Crimson Web (Factory New)|Mil-Spec|121|SCAR-20|0.02|0.36|69.00
G3SG1 | Desert Storm (Factory New)|Consumer Grade|122|G3SG1|0.08|0.27|94.00
Souvenir G3SG1 | Desert Storm (Factory New)|Consumer Grade|122|G3SG1|0.08|0.27|94.00
P250 | Sand Dune (Factory New)|Consumer Grade|123|P250|0.12|0.27|187.00
Souvenir P250 | Sand Dune (Factory New)|Consumer Grade|123|P250|0.12|0.27|187.00
Sawed-Off | Snake Camo (Factory New)|Industrial Grade|124|Sawed-Off|0.10|0.36|112.00
Souvenir Sawed-Off | Snake Camo (Factory New)|Industrial Grade|124|Sawed-Off|0.10|0.36|112.00
SG 553 | Damascus Steel (Factory New)|Mil-Spec|125|SG 553|0.17|0.03|72.00
Souvenir SG 553 | Damascus Steel (Factory New)|Mil-Spec|125|SG 553|0.17|0.03|72.00
AK-47 | Safari Mesh (Factory New)|Industrial Grade|126|AK-47|0.14|0.27|95.00
Souvenir AK-47 | Safari Mesh (Factory New)|Industrial Grade|126|AK-47|0.14|0.27|95.00
SCAR-20 | Sand Mesh (Factory New)|Consumer Grade|127|SCAR-20|0.11|0.33|84.00
Souvenir SCAR-20 | Sand Mesh (Factory New)|Consumer Grade|127|SCAR-20|0.11|0.33|84.00
Five-SeveN | Orange Peel (Factory New)|Industrial Grade|128|Five-SeveN|0.06|0.62|146.00
Souvenir Five-SeveN | Orange Peel (Factory New)|Industrial Grade|128|Five-SeveN|0.06|0.62|146.00
P2000 | Amber Fade (Factory New)|Restricted|129|P2000|0.11|0.33|78.00
Souvenir P2000 | Amber Fade (Factory New)|Restricted|129|P2000|0.11|0.33|78.00
P90 | Sand Spray (Factory New)|Consumer Grade|130|P90|0.11|0.36|98.00
Souvenir P90 | Sand Spray (Factory New)|Consumer Grade|130|P90|0.11|0.36|98.00
MP9 | Sand Dashed (Factory New)|Consumer Grade|131|MP9|0.11|0.38|107.00
Souvenir MP9 | Sand Dashed (Factory New)|Consumer Grade|131|MP9|0.11|0.38|107.00
PP-Bizon | Brass (Factory New)|Mil-Spec|132|PP-Bizon|0.15|0.30|74.00
Souvenir PP-Bizon | Brass (Factory New)|Mil-Spec|132|PP-Bizon|0.15|0.30|74.00
MAC-10 | Palm (Factory New)|Industrial Grade|133|MAC-10|0.12|0.26|163.00
Souvenir MAC-10 | Palm (Factory New)|Industrial Grade|133|MAC-10|0.12|0.26|163.00
Tec-9 | VariCamo (Factory New)|Industrial Grade|134|Tec-9|0.10|0.28|118.00
Souvenir Tec-9 | VariCamo (Factory New)|Industrial Grade|134|Tec-9|0.10|0.28|118.00
Nova | Predator (Factory New)|Consumer Grade|135|Nova|0.10|0.38|78.00
Souvenir Nova | Predator (Factory New)|Consumer Grade|135|Nova|0.10|0.38|78.00
M4A1-S | VariCamo (Factory New)|Mil-Spec|136|M4A1-S|0.11|0.26|129.00
Souvenir M4A1-S | VariCamo (Factory New)|Mil-Spec|136|M4A1-S|0.11|0.26|129.00
XM1014 | CaliCamo (Factory New)|Industrial Grade|137|XM1014|0.08|0.37|124.00
Souvenir XM1014 | CaliCamo (Factory New)|Industrial Grade|137|XM1014|0.08|0.37|124.00
Tec-9 | Groundwater (Factory New)|Consumer Grade|138|Tec-9|0.18|0.25|134.00
Souvenir Tec-9 | Groundwater (Factory New)|Consumer Grade|138|Tec-9|0.18|0.25|134.00
Sawed-Off | Full Stop (Factory New)|Mil-Spec|139|Sawed-Off|0.03|0.44|70.00
Souvenir Sawed-Off | Full Stop (Factory New)|Mil-Spec|139|Sawed-Off|0.03|0.44|70.00
AUG | Contractor (Factory New)|Consumer Grade|140|AUG|0.19|0.12|97.00
Souvenir AUG | Contractor (Factory New)|Consumer Grade|140|AUG|0.19|0.12|97.00
M4A1-S | Boreal Forest (Factory New)|Industrial Grade|141|M4A1-S|0.15|0.28|95.00
Souvenir M4A1-S | Boreal Forest (Factory New)|Industrial Grade|141|M4A1-S|0.15|0.28|95.00
FAMAS | Colony (Factory New)|Consumer Grade|142|FAMAS|0.14|0.28|145.00
Souvenir FAMAS | Colony (Factory New)|Consumer Grade|142|FAMAS|0.14|0.28|145.00
UMP-45 | Gunsmoke (Factory New)|Industrial Grade|143|UMP-45|0.09|0.16|111.00
Souvenir UMP-45 | Gunsmoke (Factory New)|Industrial Grade|143|UMP-45|0.09|0.16|111.00
Nova | Sand Dune (Factory New)|Consumer Grade|145|Nova|0.12|0.26|160.00
Souvenir Nova | Sand Dune (Factory New)|Consumer Grade|145|Nova|0.12|0.26|160.00
Glock-18 | Candy Apple (Factory New)|Mil-Spec|146|Glock-18|0.01|0.51|132.00
Souvenir Glock-18 | Candy Apple (Factory New)|Mil-Spec|146|Glock-18|0.01|0.51|132.00
P2000 | Granite Marbleized (Factory New)|Industrial Grade|147|P2000|0.14|0.12|129.00
Souvenir P2000 | Granite Marbleized (Factory New)|Industrial Grade|147|P2000|0.14|0.12|129.00
Dual Berettas | Stained (Factory New)|Industrial Grade|148|Dual Berettas|0.25|0.03|68.00
Souvenir Dual Berettas | Stained (Factory New)|Industrial Grade|148|Dual Berettas|0.25|0.03|68.00
MP7 | Anodized Navy (Factory New)|Mil-Spec|149|MP7|0.58|0.14|71.00
Souvenir MP7 | Anodized Navy (Factory New)|Mil-Spec|149|MP7|0.58|0.14|71.00
PP-Bizon | Sand Dashed (Factory New)|Consumer Grade|150|PP-Bizon|0.11|0.35|101.00
Souvenir PP-Bizon | Sand Dashed (Factory New)|Consumer Grade|150|PP-Bizon|0.11|0.35|101.00
Nova | Candy Apple (Factory New)|Industrial Grade|151|Nova|0.01|0.52|126.00
Souvenir Nova | Candy Apple (Factory New)|Industrial Grade|151|Nova|0.01|0.52|126.00
P250 | Boreal Forest (Factory New)|Consumer Grade|152|P250|0.17|0.27|96.00
Souvenir P250 | Boreal Forest (Factory New)|Consumer Grade|152|P250|0.17|0.27|96.00
USP-S | Night Ops (Factory New)|Mil-Spec|153|USP-S|0.44|0.03|86.00
Souvenir USP-S | Night Ops (Factory New)|Mil-Spec|153|USP-S|0.44|0.03|86.00
Desert Eagle | Mudder (Factory New)|Industrial Grade|154|Desert Eagle|0.11|0.39|102.00
Souvenir Desert Eagle | Mudder (Factory New)|Industrial Grade|154|Desert Eagle|0.11|0.39|102.00
XM1014 | Blue Spruce (Factory New)|Consumer Grade|155|XM1014|0.41|0.19|143.00
Souvenir XM1014 | Blue Spruce (Factory New)|Consumer Grade|155|XM1014|0.41|0.19|143.00
AUG | Storm (Factory New)|Consumer Grade|156|AUG|0.46|0.06|134.00
Souvenir AUG | Storm (Factory New)|Consumer Grade|156|AUG|0.46|0.06|134.00
AWP | Safari Mesh (Factory New)|Industrial Grade|157|AWP|0.14|0.18|85.00
Souvenir AWP | Safari Mesh (Factory New)|Industrial Grade|157|AWP|0.14|0.18|85.00
Dual Berettas | Cobalt Quartz (Factory New)|Restricted|158|Dual Berettas|0.58|0.41|74.00
Souvenir Dual Berettas | Cobalt Quartz (Factory New)|Restricted|158|Dual Berettas|0.58|0.41|74.00
Galil AR | Sage Spray (Factory New)|Consumer Grade|159|Galil AR|0.13|0.19|151.00
Souvenir Galil AR | Sage Spray (Factory New)|Consumer Grade|159|Galil AR|0.13|0.19|151.00
PP-Bizon | Night Ops (Factory New)|Industrial Grade|160|PP-Bizon|0.56|0.08|76.00
Souvenir PP-Bizon | Night Ops (Factory New)|Industrial Grade|160|PP-Bizon|0.56|0.08|76.00
P90 | Teardown (Factory New)|Mil-Spec|161|P90|0.70|0.21|70.00
Souvenir P90 | Teardown (Factory New)|Mil-Spec|161|P90|0.70|0.21|70.00
SG 553 | Waves Perforated (Factory New)|Consumer Grade|162|SG 553|0.58|0.21|95.00
Souvenir SG 553 | Waves Perforated (Factory New)|Consumer Grade|162|SG 553|0.58|0.21|95.00
G3SG1 | Jungle Dashed (Factory New)|Consumer Grade|163|G3SG1|0.21|0.23|73.00
Souvenir G3SG1 | Jungle Dashed (Factory New)|Consumer Grade|163|G3SG1|0.21|0.23|73.00
FAMAS | Cyanospatter (Factory New)|Industrial Grade|164|FAMAS|0.51|0.18|117.00
Souvenir FAMAS | Cyanospatter (Factory New)|Industrial Grade|164|FAMAS|0.51|0.18|117.00
XM1014 | Blue Steel (Factory New)|Industrial Grade|165|XM1014|0.50|0.03|63.00
Souvenir XM1014 | Blue Steel (Factory New)|Industrial Grade|165|XM1014|0.50|0.03|63.00
SG 553 | Anodized Navy (Factory New)|Mil-Spec|166|SG 553|0.50|0.05|62.00
Souvenir SG 553 | Anodized Navy (Factory New)|Mil-Spec|166|SG 553|0.50|0.05|62.00
P250 | Bone Mask (Factory New)|Consumer Grade|167|P250|0.15|0.19|123.00
Souvenir P250 | Bone Mask (Factory New)|Consumer Grade|167|P250|0.15|0.19|123.00
Negev | CaliCamo (Factory New)|Industrial Grade|168|Negev|0.09|0.36|100.00
Souvenir Negev | CaliCamo (Factory New)|Industrial Grade|168|Negev|0.09|0.36|100.00
Five-SeveN | Contractor (Factory New)|Consumer Grade|169|Five-SeveN|0.12|0.26|136.00
Souvenir Five-SeveN | Contractor (Factory New)|Consumer Grade|169|Five-SeveN|0.12|0.26|136.00
AUG | Colony (Factory New)|Consumer Grade|170|AUG|0.14|0.23|127.00
Souvenir AUG | Colony (Factory New)|Consumer Grade|170|AUG|0.14|0.23|127.00
MAG-7 | Bulldozer (Factory New)|Restricted|171|MAG-7|0.15|0.56|170.00
Souvenir MAG-7 | Bulldozer (Factory New)|Restricted|171|MAG-7|0.15|0.56|170.00
MAC-10 | Amber Fade (Factory New)|Mil-Spec|172|MAC-10|0.09|0.26|90.00
Souvenir MAC-10 | Amber Fade (Factory New)|Mil-Spec|172|MAC-10|0.09|0.26|90.00
G3SG1 | Safari Mesh (Factory New)|Consumer Grade|173|G3SG1|0.14|0.25|91.00
Souvenir G3SG1 | Safari Mesh (Factory New)|Consumer Grade|173|G3SG1|0.14|0.25|91.00
SSG 08 | Tropical Storm (Factory New)|Industrial Grade|174|SSG 08|0.54|0.11|81.00
Souvenir SSG 08 | Tropical Storm (Factory New)|Industrial Grade|174|SSG 08|0.54|0.11|81.00
P90 | Scorched (Factory New)|Consumer Grade|175|P90|0.08|0.11|55.00
Souvenir P90 | Scorched (Factory New)|Consumer Grade|175|P90|0.08|0.11|55.00
SG 553 | Gator Mesh (Factory New)|Industrial Grade|176|SG 553|0.18|0.45|77.00
Souvenir SG 553 | Gator Mesh (Factory New)|Industrial Grade|176|SG 553|0.18|0.45|77.00
Galil AR | Hunting Blind (Factory New)|Consumer Grade|177|Galil AR|0.10|0.47|95.00
Souvenir Galil AR | Hunting Blind (Factory New)|Consumer Grade|177|Galil AR|0.10|0.47|95.00
Glock-18 | Groundwater (Factory New)|Industrial Grade|178|Glock-18|0.21|0.23|141.00
Souvenir Glock-18 | Groundwater (Factory New)|Industrial Grade|178|Glock-18|0.21|0.23|141.00
UMP-45 | Blaze (Factory New)|Mil-Spec|179|UMP-45|0.07|0.36|84.00
Souvenir UMP-45 | Blaze (Factory New)|Mil-Spec|179|UMP-45|0.07|0.36|84.00
MP7 | Orange Peel (Factory New)|Industrial Grade|180|MP7|0.06|0.58|136.00
Souvenir MP7 | Orange Peel (Factory New)|Industrial Grade|180|MP7|0.06|0.58|136.00
MP9 | Hot Rod (Factory New)|Mil-Spec|181|MP9|0.00|0.56|73.00
Souvenir MP9 | Hot Rod (Factory New)|Mil-Spec|181|MP9|0.00|0.56|73.00
Dual Berettas | Contractor (Factory New)|Consumer Grade|182|Dual Berettas|0.27|0.12|81.00
Souvenir Dual Berettas | Contractor (Factory New)|Consumer Grade|182|Dual Berettas|0.27|0.12|81.00
SCAR-20 | Contractor (Factory New)|Consumer Grade|183|SCAR-20|0.15|0.16|85.00
Souvenir SCAR-20 | Contractor (Factory New)|Consumer Grade|183|SCAR-20|0.15|0.16|85.00
G3SG1 | VariCamo (Factory New)|Industrial Grade|184|G3SG1|0.11|0.20|89.00
Souvenir G3SG1 | VariCamo (Factory New)|Industrial Grade|184|G3SG1|0.11|0.20|89.00
SSG 08 | Blue Spruce (Factory New)|Consumer Grade|185|SSG 08|0.40|0.15|103.00
Souvenir SSG 08 | Blue Spruce (Factory New)|Consumer Grade|185|SSG 08|0.40|0.15|103.00
SSG 08 | Acid Fade (Factory New)|Mil-Spec|186|SSG 08|0.21|0.18|65.00
Souvenir SSG 08 | Acid Fade (Factory New)|Mil-Spec|186|SSG 08|0.21|0.18|65.00
M249 | Gator Mesh (Factory New)|Industrial Grade|187|M249|0.17|0.46|85.00
Souvenir M249 | Gator Mesh (Factory New)|Industrial Grade|187|M249|0.17|0.46|85.00
Galil AR | VariCamo (Factory New)|Industrial Grade|188|Galil AR|0.11|0.26|117.00
Souvenir Galil AR | VariCamo (Factory New)|Industrial Grade|188|Galil AR|0.11|0.26|117.00
M4A1-S | Nitro (Factory New)|Restricted|189|M4A1-S|0.07|0.19|106.00
Souvenir M4A1-S | Nitro (Factory New)|Restricted|189|M4A1-S|0.07|0.19|106.00
Tec-9 | Army Mesh (Factory New)|Consumer Grade|190|Tec-9|0.12|0.28|82.00
Souvenir Tec-9 | Army Mesh (Factory New)|Consumer Grade|190|Tec-9|0.12|0.28|82.00
Five-SeveN | Silver Quartz (Factory New)|Mil-Spec|191|Five-SeveN|0.17|0.03|68.00
Souvenir Five-SeveN | Silver Quartz (Factory New)|Mil-Spec|191|Five-SeveN|0.17|0.03|68.00
MP7 | Army Recon (Factory New)|Consumer Grade|192|MP7|0.10|0.38|97.00
Souvenir MP7 | Army Recon (Factory New)|Consumer Grade|192|MP7|0.10|0.38|97.00
USP-S | Forest Leaves (Factory New)|Industrial Grade|193|USP-S|0.15|0.40|80.00
Souvenir USP-S | Forest Leaves (Factory New)|Industrial Grade|193|USP-S|0.15|0.40|80.00
AUG | Condemned (Factory New)|Industrial Grade|194|AUG|0.08|0.30|90.00
Souvenir AUG | Condemned (Factory New)|Industrial Grade|194|AUG|0.08|0.30|90.00
FAMAS | Teardown (Factory New)|Mil-Spec|195|FAMAS|0.70|0.31|78.00
Souvenir FAMAS | Teardown (Factory New)|Mil-Spec|195|FAMAS|0.70|0.31|78.00
MP9 | Orange Peel (Factory New)|Industrial Grade|196|MP9|0.06|0.57|125.00
Souvenir MP9 | Orange Peel (Factory New)|Industrial Grade|196|MP9|0.06|0.57|125.00
UMP-45 | Urban DDPAT (Factory New)|Consumer Grade|197|UMP-45|0.15|0.07|108.00
Souvenir UMP-45 | Urban DDPAT (Factory New)|Consumer Grade|197|UMP-45|0.15|0.07|108.00
P250 | Metallic DDPAT (Factory New)|Industrial Grade|198|P250|0.25|0.04|56.00
Souvenir P250 | Metallic DDPAT (Factory New)|Industrial Grade|198|P250|0.25|0.04|56.00
Dual Berettas | Colony (Factory New)|Consumer Grade|199|Dual Berettas|0.14|0.28|125.00
Souvenir Dual Berettas | Colony (Factory New)|Consumer Grade|199|Dual Berettas|0.14|0.28|125.00
G3SG1 | Polar Camo (Factory New)|Consumer Grade|200|G3SG1|0.12|0.07|110.00
Souvenir G3SG1 | Polar Camo (Factory New)|Consumer Grade|200|G3SG1|0.12|0.07|110.00
Desert Eagle | Urban Rubble (Factory New)|Mil-Spec|201|Desert Eagle|0.10|0.06|90.00
Souvenir Desert Eagle | Urban Rubble (Factory New)|Mil-Spec|201|Desert Eagle|0.10|0.06|90.00
Tec-9 | Red Quartz (Factory New)|Restricted|202|Tec-9|0.08|0.18|67.00
Souvenir Tec-9 | Red Quartz (Factory New)|Restricted|202|Tec-9|0.08|0.18|67.00
Five-SeveN | Forest Night (Factory New)|Consumer Grade|203|Five-SeveN|0.55|0.18|119.00
Souvenir Five-SeveN | Forest Night (Factory New)|Consumer Grade|203|Five-SeveN|0.55|0.18|119.00
MAG-7 | Metallic DDPAT (Factory New)|Industrial Grade|204|MAG-7|0.33|0.02|58.00
Souvenir MAG-7 | Metallic DDPAT (Factory New)|Industrial Grade|204|MAG-7|0.33|0.02|58.00
SCAR-20 | Carbon Fiber (Factory New)|Industrial Grade|205|SCAR-20|0.22|0.06|53.00
Souvenir SCAR-20 | Carbon Fiber (Factory New)|Industrial Grade|205|SCAR-20|0.22|0.06|53.00
Sawed-Off | Amber Fade (Factory New)|Mil-Spec|206|Sawed-Off|0.07|0.36|87.00
Souvenir Sawed-Off | Amber Fade (Factory New)|Mil-Spec|206|Sawed-Off|0.07|0.36|87.00
Nova | Polar Mesh (Factory New)|Consumer Grade|207|Nova|0.13|0.09|115.00
Souvenir Nova | Polar Mesh (Factory New)|Consumer Grade|207|Nova|0.13|0.09|115.00
P90 | Ash Wood (Factory New)|Industrial Grade|208|P90|0.13|0.12|112.00
Souvenir P90 | Ash Wood (Factory New)|Industrial Grade|208|P90|0.13|0.12|112.00
PP-Bizon | Urban Dashed (Factory New)|Consumer Grade|209|PP-Bizon|0.15|0.07|107.00
Souvenir PP-Bizon | Urban Dashed (Factory New)|Consumer Grade|209|PP-Bizon|0.15|0.07|107.00
MAC-10 | Candy Apple (Factory New)|Industrial Grade|210|MAC-10|0.01|0.46|137.00
Souvenir MAC-10 | Candy Apple (Factory New)|Industrial Grade|210|MAC-10|0.01|0.46|137.00
M4A4 | Urban DDPAT (Factory New)|Industrial Grade|211|M4A4|0.13|0.08|130.00
Souvenir M4A4 | Urban DDPAT (Factory New)|Industrial Grade|211|M4A4|0.13|0.08|130.00
Five-SeveN | Kami (Factory New)|Mil-Spec|213|Five-SeveN|0.13|0.15|119.00
M249 | Magma (Factory New)|Mil-Spec|214|M249|0.13|0.18|73.00
PP-Bizon | Cobalt Halftone (Factory New)|Mil-Spec|215|PP-Bizon|0.52|0.13|86.00
FAMAS | Pulse (Factory New)|Restricted|216|FAMAS|0.91|0.50|100.00
Dual Berettas | Marina (Factory New)|Restricted|217|Dual Berettas|0.10|0.67|127.00
MP9 | Rose Iron (Factory New)|Restricted|218|MP9|0.07|0.25|73.00
Nova | Rising Skull (Factory New)|Restricted|219|Nova|0.10|0.23|136.00
M4A1-S | Guardian (Factory New)|Classified|220|M4A1-S|0.55|0.19|85.00
P250 | Mehndi (Factory New)|Classified|221|P250|0.07|0.40|108.00
Galil AR | Blue Titanium (Factory New)|Mil-Spec|224|Galil AR|0.52|0.11|74.00
AK-47 | Blue Laminate (Factory New)|Restricted|225|AK-47|0.59|0.14|79.00
Desert Eagle | Cobalt Disruption (Factory New)|Classified|226|Desert Eagle|0.58|0.64|58.00
PP-Bizon | Water Sigil (Factory New)|Mil-Spec|227|PP-Bizon|0.61|0.23|84.00
Nova | Ghost Camo (Factory New)|Mil-Spec|228|Nova|0.80|0.07|70.00
AWP | Electric Hive (Factory New)|Classified|229|AWP|0.96|0.13|70.00
M4A4 | X-Ray (Factory New)|Covert|230|M4A4|0.83|0.03|100.00
G3SG1 | Azure Zebra (Factory New)|Mil-Spec|231|G3SG1|0.60|0.54|90.00
P250 | Steel Disruption (Factory New)|Mil-Spec|232|P250|0.55|0.13|76.00
P90 | Blind Spot (Factory New)|Restricted|233|P90|0.57|0.45|87.00
FAMAS | Afterimage (Factory New)|Classified|234|FAMAS|0.77|0.16|86.00
Five-SeveN | Nightshade (Factory New)|Mil-Spec|235|Five-SeveN|0.55|0.11|96.00
Sawed-Off | The Kraken (Factory New)|Covert|236|Sawed-Off|0.07|0.40|112.00
CZ75-Auto | Crimson Web (Factory New)|Mil-Spec|237|CZ75-Auto|0.03|0.27|77.00
P2000 | Red FragCam (Factory New)|Mil-Spec|238|P2000|0.00|0.49|94.00
Dual Berettas | Panther (Factory New)|Mil-Spec|239|Dual Berettas|0.03|0.33|91.00
USP-S | Stainless (Factory New)|Mil-Spec|240|USP-S|0.17|0.06|34.00
Glock-18 | Blue Fissure (Factory New)|Mil-Spec|241|Glock-18|0.68|0.20|92.00
CZ75-Auto | Tread Plate (Factory New)|Restricted|242|CZ75-Auto|0.17|0.06|70.00
Tec-9 | Titanium Bit (Factory New)|Restricted|243|Tec-9|0.56|0.09|65.00
Desert Eagle | Heirloom (Factory New)|Restricted|244|Desert Eagle|0.14|0.10|61.00
Five-SeveN | Copper Galaxy (Factory New)|Restricted|245|Five-SeveN|0.08|0.29|66.00
CZ75-Auto | The Fuschia Is Now (Factory New)|Classified|246|CZ75-Auto|0.96|0.16|86.00
P250 | Undertow (Factory New)|Classified|247|P250|0.53|0.36|75.00
CZ75-Auto | Victoria (Factory New)|Covert|248|CZ75-Auto|0.14|0.10|60.00
UMP-45 | Corporal (Factory New)|Mil-Spec|249|UMP-45|0.13|0.16|107.00
Negev | Terrain (Factory New)|Mil-Spec|250|Negev|0.43|0.31|74.00
MAG-7 | Heaven Guard (Factory New)|Mil-Spec|252|MAG-7|0.96|0.09|93.00
MAC-10 | Heat (Factory New)|Restricted|253|MAC-10|0.08|0.37|121.00
USP-S | Guardian (Factory New)|Restricted|256|USP-S|0.28|0.05|66.00
Nova | Antique (Factory New)|Classified|259|Nova|0.07|0.53|95.00
AUG | Chameleon (Factory New)|Covert|261|AUG|0.17|0.11|70.00
★ Gut Knife | Vanilla (Factory New)|Covert|262|Gut Knife|0.99|0.15|103.00
★ Gut Knife | Blue Steel (Factory New)|Covert|263|Gut Knife|0.99|0.19|79.00
★ Gut Knife | Boreal Forest (Factory New)|Covert|264|Gut Knife|0.18|0.17|118.00
★ Gut Knife | Case Hardened (Factory New)|Covert|265|Gut Knife|0.05|0.18|125.00
★ Gut Knife | Crimson Web (Factory New)|Covert|266|Gut Knife|0.01|0.38|115.00
★ Gut Knife | Fade (Factory New)|Covert|267|Gut Knife|0.02|0.45|129.00
★ Gut Knife | Forest DDPAT (Factory New)|Covert|268|Gut Knife|0.25|0.23|120.00
★ Gut Knife | Night (Factory New)|Covert|269|Gut Knife|0.56|0.19|91.00
★ Gut Knife | Safari Mesh (Factory New)|Covert|270|Gut Knife|0.20|0.16|118.00
★ Gut Knife | Scorched (Factory New)|Covert|271|Gut Knife|0.11|0.03|101.00
★ Gut Knife | Slaughter (Factory New)|Covert|272|Gut Knife|0.00|0.49|142.00
★ Gut Knife | Stained (Factory New)|Covert|273|Gut Knife|0.00|0.15|110.00
★ Gut Knife | Urban Masked (Factory New)|Covert|274|Gut Knife|0.48|0.04|159.00
★ Flip Knife | Vanilla (Factory New)|Covert|275|Flip Knife|0.42|0.02|91.00
★ Flip Knife | Blue Steel (Factory New)|Covert|276|Flip Knife|0.47|0.10|61.00
★ Flip Knife | Boreal Forest (Factory New)|Covert|277|Flip Knife|0.17|0.18|104.00
★ Flip Knife | Case Hardened (Factory New)|Covert|278|Flip Knife|0.17|0.19|103.00
★ Flip Knife | Crimson Web (Factory New)|Covert|279|Flip Knife|0.01|0.39|99.00
★ Flip Knife | Fade (Factory New)|Covert|280|Flip Knife|0.05|0.26|92.00
★ Flip Knife | Forest DDPAT (Factory New)|Covert|281|Flip Knife|0.22|0.23|105.00
★ Flip Knife | Night (Factory New)|Covert|282|Flip Knife|0.55|0.14|80.00
★ Flip Knife | Safari Mesh (Factory New)|Covert|283|Flip Knife|0.17|0.19|107.00
★ Flip Knife | Scorched (Factory New)|Covert|284|Flip Knife|0.08|0.06|70.00
★ Flip Knife | Slaughter (Factory New)|Covert|285|Flip Knife|0.02|0.36|104.00
★ Flip Knife | Stained (Factory New)|Covert|286|Flip Knife|0.37|0.06|84.00
★ Flip Knife | Urban Masked (Factory New)|Covert|287|Flip Knife|0.29|0.03|155.00
★ Bayonet | Vanilla (Factory New)|Covert|288|Bayonet|0.54|0.05|164.00
★ Bayonet | Blue Steel (Factory New)|Covert|289|Bayonet|0.44|0.10|81.00
★ Bayonet | Boreal Forest (Factory New)|Covert|290|Bayonet|0.18|0.20|117.00
★ Bayonet | Case Hardened (Factory New)|Covert|291|Bayonet|0.19|0.16|139.00
★ Bayonet | Crimson Web (Factory New)|Covert|292|Bayonet|0.00|0.45|124.00
★ Bayonet | Fade (Factory New)|Covert|293|Bayonet|0.06|0.28|122.00
★ Bayonet | Forest DDPAT (Factory New)|Covert|294|Bayonet|0.21|0.22|122.00
★ Bayonet | Night (Factory New)|Covert|295|Bayonet|0.55|0.15|89.00
★ Bayonet | Safari Mesh (Factory New)|Covert|296|Bayonet|0.18|0.19|122.00
★ Bayonet | Scorched (Factory New)|Covert|297|Bayonet|0.11|0.03|89.00
★ Bayonet | Slaughter (Factory New)|Covert|298|Bayonet|0.02|0.41|142.00
★ Bayonet | Stained (Factory New)|Covert|299|Bayonet|0.33|0.05|113.00
★ Bayonet | Urban Masked (Factory New)|Covert|300|Bayonet|0.37|0.03|167.00
★ M9 Bayonet | Vanilla (Factory New)|Covert|301|M9 Bayonet|0.56|0.12|101.00
★ M9 Bayonet | Blue Steel (Factory New)|Covert|302|M9 Bayonet|0.59|0.21|61.00
★ M9 Bayonet | Boreal Forest (Factory New)|Covert|303|M9 Bayonet|0.19|0.18|109.00
★ M9 Bayonet | Case Hardened (Factory New)|Covert|304|M9 Bayonet|0.14|0.16|109.00
★ M9 Bayonet | Crimson Web (Factory New)|Covert|305|M9 Bayonet|0.00|0.46|118.00
★ M9 Bayonet | Fade (Factory New)|Covert|306|M9 Bayonet|0.02|0.29|104.00
★ M9 Bayonet | Forest DDPAT (Factory New)|Covert|307|M9 Bayonet|0.23|0.22|116.00
★ M9 Bayonet | Night (Factory New)|Covert|308|M9 Bayonet|0.57|0.18|84.00
★ M9 Bayonet | Safari Mesh (Factory New)|Covert|309|M9 Bayonet|0.19|0.18|114.00
★ M9 Bayonet | Scorched (Factory New)|Covert|310|M9 Bayonet|0.11|0.04|85.00
★ M9 Bayonet | Slaughter (Factory New)|Covert|311|M9 Bayonet|0.99|0.43|119.00
★ M9 Bayonet | Stained (Factory New)|Covert|312|M9 Bayonet|0.56|0.10|91.00
★ M9 Bayonet | Urban Masked (Factory New)|Covert|313|M9 Bayonet|0.47|0.04|148.00
★ Karambit | Vanilla (Factory New)|Covert|314|Karambit|0.58|0.04|54.00
★ Karambit | Blue Steel (Factory New)|Covert|315|Karambit|0.56|0.13|111.00
★ Karambit | Boreal Forest (Factory New)|Covert|316|Karambit|0.32|0.19|111.00
★ Karambit | Case Hardened (Factory New)|Covert|317|Karambit|0.26|0.05|128.00
★ Karambit | Crimson Web (Factory New)|Covert|318|Karambit|0.01|0.25|103.00
★ Karambit | Fade (Factory New)|Covert|319|Karambit|0.88|0.13|118.00
★ Karambit | Forest DDPAT (Factory New)|Covert|320|Karambit|0.18|0.16|100.00
★ Karambit | Night (Factory New)|Covert|321|Karambit|0.57|0.09|77.00
★ Karambit | Safari Mesh (Factory New)|Covert|322|Karambit|0.20|0.17|117.00
★ Karambit | Scorched (Factory New)|Covert|323|Karambit|0.08|0.03|127.00
★ Karambit | Slaughter (Factory New)|Covert|324|Karambit|0.99|0.21|131.00
★ Karambit | Stained (Factory New)|Covert|325|Karambit|0.56|0.07|110.00
★ Karambit | Urban Masked (Factory New)|Covert|326|Karambit|0.48|0.04|156.00
Tec-9 | Isaac (Factory New)|Mil-Spec|327|Tec-9|0.02|0.29|79.00
Dual Berettas | Retribution (Factory New)|Mil-Spec|329|Dual Berettas|0.16|0.29|78.00
Galil AR | Kami (Factory New)|Mil-Spec|330|Galil AR|0.13|0.15|136.00
P90 | Desert Warfare (Factory New)|Mil-Spec|331|P90|0.14|0.24|86.00
CZ75-Auto | Poison Dart (Factory New)|Mil-Spec|332|CZ75-Auto|0.25|0.04|57.00
AUG | Torque (Factory New)|Restricted|333|AUG|0.15|0.12|78.00
PP-Bizon | Antique (Factory New)|Restricted|334|PP-Bizon|0.08|0.43|84.00
MAC-10 | Curse (Factory New)|Restricted|335|MAC-10|0.07|0.30|131.00
XM1014 | Heaven Guard (Factory New)|Restricted|336|XM1014|0.98|0.15|108.00
M4A1-S | Atomic Alloy (Factory New)|Classified|337|M4A1-S|0.04|0.53|57.00
SCAR-20 | Cyrex (Factory New)|Classified|338|SCAR-20|0.07|0.14|74.00
USP-S | Orion (Factory New)|Classified|339|USP-S|0.09|0.42|91.00
AK-47 | Vulcan (Factory New)|Covert|340|AK-47|0.29|0.04|92.00
M4A4 | Howl (Factory New)|Contraband|341|M4A4|0.03|0.49|109.00
P250 | Franklin (Factory New)|Classified|342|P250|0.16|0.13|135.00
AK-47 | Emerald Pinstripe (Factory New)|Restricted|343|AK-47|0.17|0.07|67.00
CZ75-Auto | Tuxedo (Factory New)|Mil-Spec|344|CZ75-Auto|0.15|0.15|106.00
Desert Eagle | Meteorite (Factory New)|Mil-Spec|345|Desert Eagle|0.10|0.24|34.00
G3SG1 | Green Apple (Factory New)|Industrial Grade|346|G3SG1|0.27|0.34|99.00
Galil AR | Tuxedo (Factory New)|Mil-Spec|347|Galil AR|0.14|0.12|116.00
MAC-10 | Silver (Factory New)|Industrial Grade|349|MAC-10|0.14|0.07|97.00
MP7 | Forest DDPAT (Factory New)|Consumer Grade|350|MP7|0.15|0.28|101.00
Negev | Army Sheen (Factory New)|Consumer Grade|351|Negev|0.17|0.12|68.00
Nova | Caged Steel (Factory New)|Industrial Grade|352|Nova|0.33|0.04|50.00
Sawed-Off | Forest DDPAT (Factory New)|Consumer Grade|353|Sawed-Off|0.17|0.26|87.00
SG 553 | Army Sheen (Factory New)|Consumer Grade|354|SG 553|0.14|0.09|74.00
Tec-9 | Urban DDPAT (Factory New)|Consumer Grade|355|Tec-9|0.11|0.08|112.00
UMP-45 | Carbon Fiber (Factory New)|Industrial Grade|356|UMP-45|0.17|0.05|63.00
★ Huntsman Knife | Vanilla (Factory New)|Covert|357|Huntsman Knife|0.61|0.05|60.00
★ Huntsman Knife | Blue Steel (Factory New)|Covert|358|Huntsman Knife|0.57|0.23|109.00
★ Huntsman Knife | Boreal Forest (Factory New)|Covert|359|Huntsman Knife|0.22|0.15|88.00
★ Huntsman Knife | Case Hardened (Factory New)|Covert|360|Huntsman Knife|0.52|0.06|129.00
★ Huntsman Knife | Crimson Web (Factory New)|Covert|361|Huntsman Knife|0.00|0.40|108.00
★ Huntsman Knife | Fade (Factory New)|Covert|362|Huntsman Knife|0.10|0.30|148.00
★ Huntsman Knife | Forest DDPAT (Factory New)|Covert|363|Huntsman Knife|0.18|0.15|93.00
★ Huntsman Knife | Night (Factory New)|Covert|364|Huntsman Knife|0.56|0.12|67.00
★ Huntsman Knife | Safari Mesh (Factory New)|Covert|365|Huntsman Knife|0.19|0.14|93.00
★ Huntsman Knife | Scorched (Factory New)|Covert|366|Huntsman Knife|0.17|0.02|112.00
★ Huntsman Knife | Slaughter (Factory New)|Covert|367|Huntsman Knife|0.99|0.34|151.00
★ Huntsman Knife | Stained (Factory New)|Covert|368|Huntsman Knife|0.57|0.12|120.00
★ Huntsman Knife | Urban Masked (Factory New)|Covert|369|Huntsman Knife|0.50|0.03|115.00
CZ75-Auto | Twist (Factory New)|Mil-Spec|370|CZ75-Auto|0.21|0.05|83.00
P90 | Module (Factory New)|Mil-Spec|371|P90|0.52|0.45|78.00
P2000 | Pulse (Factory New)|Mil-Spec|372|P2000|0.35|0.30|99.00
MAC-10 | Tatter (Factory New)|Restricted|373|MAC-10|0.08|0.23|105.00
USP-S | Caiman (Factory New)|Classified|374|USP-S|0.06|0.22|69.00
M4A4 | Desert-Strike (Factory New)|Covert|375|M4A4|0.11|0.24|93.00
M4A1-S | Cyrex (Factory New)|Covert|376|M4A1-S|0.02|0.27|90.00
MP7 | Urban Hazard (Factory New)|Mil-Spec|377|MP7|0.08|0.27|88.00
Negev | Desert-Strike (Factory New)|Mil-Spec|378|Negev|0.12|0.26|94.00
Nova | Koi (Factory New)|Restricted|379|Nova|0.05|0.29|122.00
P250 | Supernova (Factory New)|Restricted|380|P250|0.08|0.23|73.00
SSG 08 | Abyss (Factory New)|Mil-Spec|381|SSG 08|0.55|0.17|63.00
UMP-45 | Labyrinth (Factory New)|Mil-Spec|382|UMP-45|0.14|0.13|127.00
PP-Bizon | Osiris (Factory New)|Restricted|383|PP-Bizon|0.10|0.31|88.00
CZ75-Auto | Tigris (Factory New)|Restricted|384|CZ75-Auto|0.07|0.51|92.00
Desert Eagle | Conspiracy (Factory New)|Classified|385|Desert Eagle|0.12|0.13|61.00
Five-SeveN | Fowl Play (Factory New)|Classified|386|Five-SeveN|0.43|0.09|75.00
Glock-18 | Water Elemental (Factory New)|Classified|387|Glock-18|0.96|0.28|109.00
P2000 | Ivory (Factory New)|Mil-Spec|388|P2000|0.15|0.17|145.00
P90 | Asiimov (Factory New)|Covert|389|P90|0.07|0.29|163.00
P90 | Leather (Factory New)|Industrial Grade|390|P90|0.06|0.42|99.00
MAC-10 | Commuter (Factory New)|Industrial Grade|391|MAC-10|0.10|0.25|106.00
Sawed-Off | First Class (Factory New)|Mil-Spec|392|Sawed-Off|0.27|0.13|60.00
P2000 | Coach Class (Factory New)|Industrial Grade|393|P2000|0.09|0.37|118.00
USP-S | Business Class (Factory New)|Mil-Spec|394|USP-S|0.08|0.25|72.00
G3SG1 | Contractor (Factory New)|Consumer Grade|395|G3SG1|0.17|0.13|90.00
MP7 | Olive Plaid (Factory New)|Consumer Grade|396|MP7|0.14|0.26|111.00
CZ75-Auto | Green Plaid (Factory New)|Consumer Grade|397|CZ75-Auto|0.17|0.20|103.00
MP9 | Green Plaid (Factory New)|Consumer Grade|398|MP9|0.17|0.19|79.00
SSG 08 | Sand Dune (Factory New)|Consumer Grade|399|SSG 08|0.11|0.23|121.00
SG 553 | Traveler (Factory New)|Industrial Grade|400|SG 553|0.09|0.20|85.00
XM1014 | Red Leather (Factory New)|Mil-Spec|401|XM1014|0.03|0.32|93.00
Desert Eagle | Pilot (Factory New)|Restricted|402|Desert Eagle|0.11|0.20|79.00
AK-47 | Jet Set (Factory New)|Classified|403|AK-47|0.09|0.24|95.00
AK-47 | First Class (Factory New)|Restricted|404|AK-47|0.22|0.09|66.00
AWP | Dragon Lore (Factory New)|Covert|405|AWP|0.11|0.44|105.00
Souvenir AWP | Dragon Lore (Factory New)|Covert|405|AWP|0.11|0.44|105.00
P90 | Storm (Factory New)|Consumer Grade|406|P90|0.39|0.08|148.00
Souvenir P90 | Storm (Factory New)|Consumer Grade|406|P90|0.39|0.08|148.00
UMP-45 | Indigo (Factory New)|Consumer Grade|407|UMP-45|0.61|0.32|136.00
Souvenir UMP-45 | Indigo (Factory New)|Consumer Grade|407|UMP-45|0.61|0.32|136.00
MAC-10 | Indigo (Factory New)|Consumer Grade|408|MAC-10|0.61|0.34|139.00
Souvenir MAC-10 | Indigo (Factory New)|Consumer Grade|408|MAC-10|0.61|0.34|139.00
SCAR-20 | Storm (Factory New)|Consumer Grade|409|SCAR-20|0.50|0.06|112.00
Souvenir SCAR-20 | Storm (Factory New)|Consumer Grade|409|SCAR-20|0.50|0.06|112.00
USP-S | Royal Blue (Factory New)|Industrial Grade|410|USP-S|0.66|0.53|72.00
Souvenir USP-S | Royal Blue (Factory New)|Industrial Grade|410|USP-S|0.66|0.53|72.00
Dual Berettas | Briar (Factory New)|Consumer Grade|411|Dual Berettas|0.21|0.30|69.00
Souvenir Dual Berettas | Briar (Factory New)|Consumer Grade|411|Dual Berettas|0.21|0.30|69.00
Nova | Green Apple (Factory New)|Industrial Grade|412|Nova|0.27|0.39|102.00
Souvenir Nova | Green Apple (Factory New)|Industrial Grade|412|Nova|0.27|0.39|102.00
MAG-7 | Silver (Factory New)|Industrial Grade|413|MAG-7|0.17|0.07|91.00
Souvenir MAG-7 | Silver (Factory New)|Industrial Grade|413|MAG-7|0.17|0.07|91.00
MP9 | Dark Age (Factory New)|Mil-Spec|414|MP9|0.17|0.08|63.00
Souvenir MP9 | Dark Age (Factory New)|Mil-Spec|414|MP9|0.17|0.08|63.00
Desert Eagle | Hand Cannon (Factory New)|Restricted|415|Desert Eagle|0.43|0.24|62.00
Souvenir Desert Eagle | Hand Cannon (Factory New)|Restricted|415|Desert Eagle|0.43|0.24|62.00
P2000 | Chainmail (Factory New)|Mil-Spec|416|P2000|0.14|0.13|85.00
Souvenir P2000 | Chainmail (Factory New)|Mil-Spec|416|P2000|0.14|0.13|85.00
Sawed-Off | Rust Coat (Factory New)|Industrial Grade|417|Sawed-Off|0.06|0.25|77.00
Souvenir Sawed-Off | Rust Coat (Factory New)|Industrial Grade|417|Sawed-Off|0.06|0.25|77.00
M4A1-S | Knight (Factory New)|Classified|418|M4A1-S|0.12|0.12|56.00
Souvenir M4A1-S | Knight (Factory New)|Classified|418|M4A1-S|0.12|0.12|56.00
CZ75-Auto | Chalice (Factory New)|Restricted|419|CZ75-Auto|0.03|0.08|63.00
Souvenir CZ75-Auto | Chalice (Factory New)|Restricted|419|CZ75-Auto|0.03|0.08|63.00
M4A1-S | Master Piece (Factory New)|Classified|420|M4A1-S|0.52|0.12|90.00
Souvenir M4A1-S | Master Piece (Factory New)|Classified|420|M4A1-S|0.52|0.12|90.00
Desert Eagle | Urban DDPAT (Factory New)|Industrial Grade|421|Desert Eagle|0.11|0.09|103.00
Souvenir Desert Eagle | Urban DDPAT (Factory New)|Industrial Grade|421|Desert Eagle|0.11|0.09|103.00
MP7 | Gunsmoke (Factory New)|Industrial Grade|422|MP7|0.08|0.24|123.00
Souvenir MP7 | Gunsmoke (Factory New)|Industrial Grade|422|MP7|0.08|0.24|123.00
Glock-18 | Night (Factory New)|Industrial Grade|423|Glock-18|0.52|0.11|73.00
Souvenir Glock-18 | Night (Factory New)|Industrial Grade|423|Glock-18|0.52|0.11|73.00
P2000 | Grassland (Factory New)|Industrial Grade|424|P2000|0.11|0.34|195.00
Souvenir P2000 | Grassland (Factory New)|Industrial Grade|424|P2000|0.11|0.34|195.00
CZ75-Auto | Nitro (Factory New)|Mil-Spec|425|CZ75-Auto|0.06|0.37|144.00
Souvenir CZ75-Auto | Nitro (Factory New)|Mil-Spec|425|CZ75-Auto|0.06|0.37|144.00
Sawed-Off | Sage Spray (Factory New)|Consumer Grade|426|Sawed-Off|0.12|0.20|141.00
Souvenir Sawed-Off | Sage Spray (Factory New)|Consumer Grade|426|Sawed-Off|0.12|0.20|141.00
UMP-45 | Scorched (Factory New)|Consumer Grade|427|UMP-45|0.08|0.11|57.00
Souvenir UMP-45 | Scorched (Factory New)|Consumer Grade|427|UMP-45|0.08|0.11|57.00
M249 | Contrast Spray (Factory New)|Consumer Grade|428|M249|0.12|0.10|126.00
Souvenir M249 | Contrast Spray (Factory New)|Consumer Grade|428|M249|0.12|0.10|126.00
MAG-7 | Storm (Factory New)|Consumer Grade|429|MAG-7|0.43|0.09|160.00
Souvenir MAG-7 | Storm (Factory New)|Consumer Grade|429|MAG-7|0.43|0.09|160.00
MP9 | Storm (Factory New)|Consumer Grade|430|MP9|0.40|0.09|168.00
Souvenir MP9 | Storm (Factory New)|Consumer Grade|430|MP9|0.40|0.09|168.00
XM1014 | VariCamo Blue (Factory New)|Mil-Spec|431|XM1014|0.56|0.29|93.00
Souvenir XM1014 | VariCamo Blue (Factory New)|Mil-Spec|431|XM1014|0.56|0.29|93.00
AWP | Pink DDPAT (Factory New)|Restricted|432|AWP|0.90|0.14|74.00
Souvenir AWP | Pink DDPAT (Factory New)|Restricted|432|AWP|0.90|0.14|74.00
USP-S | Road Rash (Factory New)|Restricted|433|USP-S|0.21|0.11|142.00
Souvenir USP-S | Road Rash (Factory New)|Restricted|433|USP-S|0.21|0.11|142.00
SSG 08 | Detour (Factory New)|Mil-Spec|434|SSG 08|0.17|0.09|97.00
Souvenir SSG 08 | Detour (Factory New)|Mil-Spec|434|SSG 08|0.17|0.09|97.00
★ Butterfly Knife | Vanilla (Factory New)|Covert|435|Butterfly Knife|0.59|0.12|78.00
★ Butterfly Knife | Blue Steel (Factory New)|Covert|436|Butterfly Knife|0.58|0.22|54.00
★ Butterfly Knife | Boreal Forest (Factory New)|Covert|437|Butterfly Knife|0.33|0.21|99.00
★ Butterfly Knife | Case Hardened (Factory New)|Covert|438|Butterfly Knife|0.17|0.08|84.00
★ Butterfly Knife | Crimson Web (Factory New)|Covert|439|Butterfly Knife|0.98|0.28|80.00
★ Butterfly Knife | Fade (Factory New)|Covert|440|Butterfly Knife|0.02|0.40|85.00
★ Butterfly Knife | Forest DDPAT (Factory New)|Covert|441|Butterfly Knife|0.19|0.18|84.00
★ Butterfly Knife | Night (Factory New)|Covert|442|Butterfly Knife|0.59|0.13|70.00
★ Butterfly Knife | Safari Mesh (Factory New)|Covert|443|Butterfly Knife|0.19|0.18|102.00
★ Butterfly Knife | Scorched (Factory New)|Covert|444|Butterfly Knife|0.11|0.04|74.00
★ Butterfly Knife | Slaughter (Factory New)|Covert|445|Butterfly Knife|0.99|0.40|89.00
★ Butterfly Knife | Stained (Factory New)|Covert|446|Butterfly Knife|0.57|0.12|73.00
★ Butterfly Knife | Urban Masked (Factory New)|Covert|447|Butterfly Knife|0.50|0.05|132.00
M4A4 | Bullet Rain (Factory New)|Covert|448|M4A4|0.04|0.29|119.00
P2000 | Corticera (Factory New)|Classified|449|P2000|0.55|0.16|87.00
AWP | Corticera (Factory New)|Classified|450|AWP|0.52|0.11|72.00
AK-47 | Jaguar (Factory New)|Covert|451|AK-47|0.10|0.32|108.00
Nova | Bloomstick (Factory New)|Classified|452|Nova|0.02|0.41|93.00
AUG | Bengal Tiger (Factory New)|Classified|453|AUG|0.08|0.30|112.00
Desert Eagle | Crimson Web (Factory New)|Restricted|454|Desert Eagle|0.00|0.74|105.00
Glock-18 | Steel Disruption (Factory New)|Restricted|455|Glock-18|0.33|0.03|74.00
MP7 | Ocean Foam (Factory New)|Restricted|456|MP7|0.61|0.15|71.00
PP-Bizon | Blue Streak (Factory New)|Restricted|457|PP-Bizon|0.54|0.49|99.00
Negev | Bratatat (Factory New)|Mil-Spec|459|Negev|0.10|0.26|87.00
CZ75-Auto | Hexane (Factory New)|Mil-Spec|460|CZ75-Auto|0.56|0.35|75.00
USP-S | Blood Tiger (Factory New)|Mil-Spec|461|USP-S|0.08|0.26|70.00
MAC-10 | Ultraviolet (Factory New)|Mil-Spec|462|MAC-10|0.77|0.21|71.00
P90 | Virus (Factory New)|Restricted|464|P90|0.21|0.26|80.00
Galil AR | Cerberus (Factory New)|Restricted|465|Galil AR|0.17|0.52|110.00
Souvenir Galil AR | Cerberus (Factory New)|Restricted|465|Galil AR|0.17|0.52|110.00
Tec-9 | Toxic (Factory New)|Mil-Spec|466|Tec-9|0.11|0.55|130.00
Souvenir Tec-9 | Toxic (Factory New)|Mil-Spec|466|Tec-9|0.11|0.55|130.00
Glock-18 | Reactor (Factory New)|Mil-Spec|467|Glock-18|0.11|0.28|78.00
Souvenir Glock-18 | Reactor (Factory New)|Mil-Spec|467|Glock-18|0.11|0.28|78.00
XM1014 | Bone Machine (Factory New)|Mil-Spec|468|XM1014|0.18|0.16|80.00
Souvenir XM1014 | Bone Machine (Factory New)|Mil-Spec|468|XM1014|0.18|0.16|80.00
MAC-10 | Nuclear Garden (Factory New)|Mil-Spec|469|MAC-10|0.19|0.30|102.00
Souvenir MAC-10 | Nuclear Garden (Factory New)|Mil-Spec|469|MAC-10|0.19|0.30|102.00
AUG | Radiation Hazard (Factory New)|Industrial Grade|470|AUG|0.03|0.42|99.00
Souvenir AUG | Radiation Hazard (Factory New)|Industrial Grade|470|AUG|0.03|0.42|99.00
MP9 | Setting Sun (Factory New)|Mil-Spec|471|MP9|0.03|0.70|128.00
Souvenir MP9 | Setting Sun (Factory New)|Mil-Spec|471|MP9|0.03|0.70|128.00
PP-Bizon | Chemical Green (Factory New)|Industrial Grade|472|PP-Bizon|0.19|0.49|126.00
Souvenir PP-Bizon | Chemical Green (Factory New)|Industrial Grade|472|PP-Bizon|0.19|0.49|126.00
Negev | Nuclear Waste (Factory New)|Industrial Grade|473|Negev|0.09|0.71|110.00
Souvenir Negev | Nuclear Waste (Factory New)|Industrial Grade|473|Negev|0.09|0.71|110.00
FAMAS | Styx (Factory New)|Restricted|474|FAMAS|0.03|0.43|68.00
Souvenir FAMAS | Styx (Factory New)|Restricted|474|FAMAS|0.03|0.43|68.00
P250 | Contamination (Factory New)|Industrial Grade|475|P250|0.13|0.28|135.00
Souvenir P250 | Contamination (Factory New)|Industrial Grade|475|P250|0.13|0.28|135.00
Five-SeveN | Hot Shot (Factory New)|Industrial Grade|476|Five-SeveN|0.18|0.33|173.00
Souvenir Five-SeveN | Hot Shot (Factory New)|Industrial Grade|476|Five-SeveN|0.18|0.33|173.00
SG 553 | Fallout Warning (Factory New)|Industrial Grade|477|SG 553|0.03|0.33|69.00
Souvenir SG 553 | Fallout Warning (Factory New)|Industrial Grade|477|SG 553|0.03|0.33|69.00
AK-47 | Wasteland Rebel (Factory New)|Covert|478|AK-47|0.10|0.21|87.00
Five-SeveN | Urban Hazard (Factory New)|Mil-Spec|479|Five-SeveN|0.02|0.47|122.00
G3SG1 | Murky (Factory New)|Mil-Spec|480|G3SG1|0.28|0.05|59.00
Glock-18 | Grinder (Factory New)|Restricted|481|Glock-18|0.17|0.07|70.00
M4A1-S | Basilisk (Factory New)|Restricted|482|M4A1-S|0.22|0.05|57.00
M4A4 | Griffin (Factory New)|Restricted|483|M4A4|0.09|0.22|88.00
MAG-7 | Firestarter (Factory New)|Mil-Spec|484|MAG-7|0.12|0.15|153.00
MP9 | Dart (Factory New)|Mil-Spec|485|MP9|0.14|0.08|72.00
P250 | Cartel (Factory New)|Classified|486|P250|0.25|0.04|56.00
P2000 | Fire Elemental (Factory New)|Covert|487|P2000|0.66|0.27|119.00
Sawed-Off | Highwayman (Factory New)|Restricted|488|Sawed-Off|0.07|0.33|72.00
SCAR-20 | Cardiac (Factory New)|Classified|489|SCAR-20|0.77|0.11|75.00
UMP-45 | Delusion (Factory New)|Mil-Spec|490|UMP-45|0.17|0.51|149.00
XM1014 | Tranquility (Factory New)|Classified|491|XM1014|0.02|0.50|140.00
AK-47 | Cartel (Factory New)|Classified|492|AK-47|0.05|0.28|61.00
Desert Eagle | Naga (Factory New)|Restricted|494|Desert Eagle|0.13|0.15|68.00
Glock-18 | Catacombs (Factory New)|Mil-Spec|496|Glock-18|0.17|0.07|82.00
M249 | System Lock (Factory New)|Mil-Spec|497|M249|0.01|0.55|119.00
XM1014 | Quicksilver (Factory New)|Mil-Spec|498|XM1014|0.39|0.04|69.00
MAC-10 | Malachite (Factory New)|Restricted|499|MAC-10|0.45|0.30|108.00
MP9 | Deadly Poison (Factory New)|Mil-Spec|500|MP9|0.20|0.20|81.00
P250 | Muertos (Factory New)|Classified|501|P250|0.01|0.68|132.00
M4A4 | 龍王 (Dragon King) (Factory New)|Classified|502|M4A4|0.88|0.21|115.00
Sawed-Off | Serenity (Factory New)|Restricted|503|Sawed-Off|0.49|0.31|111.00
SCAR-20 | Grotto (Factory New)|Mil-Spec|504|SCAR-20|0.52|0.20|56.00
Dual Berettas | Urban Shock (Factory New)|Restricted|505|Dual Berettas|0.56|0.31|102.00
★ Gut Knife | Damascus Steel (Factory New)|Covert|506|Gut Knife|0.02|0.15|124.00
★ Gut Knife | Marble Fade (Factory New)|Covert|508|Gut Knife|0.95|0.36|97.00
★ Gut Knife | Tiger Tooth (Factory New)|Covert|509|Gut Knife|0.09|0.67|156.00
★ Gut Knife | Ultraviolet (Factory New)|Covert|511|Gut Knife|0.73|0.29|100.00
★ Flip Knife | Damascus Steel (Factory New)|Covert|512|Flip Knife|0.42|0.06|96.00
★ Flip Knife | Marble Fade (Factory New)|Covert|514|Flip Knife|0.09|0.28|81.00
★ Flip Knife | Tiger Tooth (Factory New)|Covert|515|Flip Knife|0.10|0.53|120.00
★ Flip Knife | Ultraviolet (Factory New)|Covert|517|Flip Knife|0.74|0.29|80.00
★ Bayonet | Damascus Steel (Factory New)|Covert|518|Bayonet|0.36|0.05|132.00
★ Bayonet | Marble Fade (Factory New)|Covert|520|Bayonet|0.11|0.25|100.00
★ Bayonet | Tiger Tooth (Factory New)|Covert|521|Bayonet|0.10|0.58|165.00
★ Bayonet | Ultraviolet (Factory New)|Covert|523|Bayonet|0.73|0.23|90.00
★ M9 Bayonet | Damascus Steel (Factory New)|Covert|524|M9 Bayonet|0.54|0.08|107.00
★ M9 Bayonet | Marble Fade (Factory New)|Covert|526|M9 Bayonet|0.04|0.25|77.00
★ M9 Bayonet | Tiger Tooth (Factory New)|Covert|527|M9 Bayonet|0.10|0.62|131.00
★ M9 Bayonet | Ultraviolet (Factory New)|Covert|529|M9 Bayonet|0.73|0.25|87.00
★ Karambit | Damascus Steel (Factory New)|Covert|530|Karambit|0.54|0.07|118.00
★ Karambit | Marble Fade (Factory New)|Covert|532|Karambit|0.62|0.14|123.00
★ Karambit | Tiger Tooth (Factory New)|Covert|533|Karambit|0.13|0.43|145.00
★ Karambit | Ultraviolet (Factory New)|Covert|535|Karambit|0.65|0.11|88.00
MAC-10 | Neon Rider (Factory New)|Covert|536|MAC-10|0.78|0.11|138.00
M4A1-S | Hyper Beast (Factory New)|Covert|537|M4A1-S|0.62|0.22|90.00
FAMAS | Djinn (Factory New)|Classified|538|FAMAS|0.17|0.08|51.00
CZ75-Auto | Pole Position (Factory New)|Restricted|542|CZ75-Auto|0.02|0.08|125.00
MAG-7 | Heat (Factory New)|Restricted|543|MAG-7|0.04|0.65|136.00
AWP | Worm God (Factory New)|Restricted|544|AWP|0.14|0.09|77.00
Sawed-Off | Origami (Factory New)|Mil-Spec|545|Sawed-Off|0.08|0.65|127.00
P250 | Valence (Factory New)|Mil-Spec|547|P250|0.52|0.12|64.00
Desert Eagle | Bronze Deco (Factory New)|Mil-Spec|548|Desert Eagle|0.10|0.29|62.00
MP7 | Armor Core (Factory New)|Mil-Spec|549|MP7|0.17|0.05|63.00
AK-47 | Elite Build (Factory New)|Mil-Spec|550|AK-47|0.11|0.13|46.00
AWP | Hyper Beast (Factory New)|Covert|551|AWP|0.64|0.10|73.00
AK-47 | Aquamarine Revenge (Factory New)|Covert|552|AK-47|0.19|0.14|87.00
SG 553 | Cyrex (Factory New)|Classified|553|SG 553|0.04|0.23|75.00
MP7 | Nemesis (Factory New)|Classified|554|MP7|0.13|0.29|84.00
CZ75-Auto | Yellow Jacket (Factory New)|Classified|555|CZ75-Auto|0.13|0.59|129.00
P2000 | Handgun (Factory New)|Restricted|556|P2000|0.51|0.31|88.00
MP9 | Ruby Poison Dart (Factory New)|Restricted|558|MP9|0.00|0.37|81.00
M4A4 | Evil Daimyo (Factory New)|Restricted|559|M4A4|0.01|0.45|112.00
FAMAS | Neural Net (Factory New)|Restricted|560|FAMAS|0.13|0.52|94.00
USP-S | Torque (Factory New)|Mil-Spec|561|USP-S|0.16|0.16|99.00
UMP-45 | Riot (Factory New)|Mil-Spec|562|UMP-45|0.17|0.14|87.00
P90 | Elite Build (Factory New)|Mil-Spec|563|P90|0.12|0.10|70.00
Nova | Ranger (Factory New)|Mil-Spec|564|Nova|0.20|0.21|84.00
Glock-18 | Bunsen Burner (Factory New)|Mil-Spec|565|Glock-18|0.48|0.13|67.00
Galil AR | Rocket Pop (Factory New)|Mil-Spec|566|Galil AR|0.59|0.33|138.00
SCAR-20 | Army Sheen (Factory New)|Consumer Grade|567|SCAR-20|0.19|0.12|56.00
CZ75-Auto | Army Sheen (Factory New)|Consumer Grade|568|CZ75-Auto|0.21|0.11|62.00
M249 | Impact Drill (Factory New)|Consumer Grade|569|M249|0.13|0.59|129.00
MAG-7 | Seabird (Factory New)|Consumer Grade|570|MAG-7|0.46|0.21|130.00
Desert Eagle | Night (Factory New)|Industrial Grade|571|Desert Eagle|0.42|0.04|57.00
Galil AR | Urban Rubble (Factory New)|Industrial Grade|572|Galil AR|0.17|0.02|91.00
USP-S | Para Green (Factory New)|Industrial Grade|573|USP-S|0.21|0.18|100.00
MAC-10 | Fade (Factory New)|Mil-Spec|574|MAC-10|0.01|0.17|86.00
P250 | Whiteout (Factory New)|Mil-Spec|575|P250|0.15|0.08|213.00
MP7 | Full Stop (Factory New)|Mil-Spec|576|MP7|0.03|0.52|83.00
Five-SeveN | Nitro (Factory New)|Mil-Spec|577|Five-SeveN|0.06|0.49|166.00
CZ75-Auto | Emerald (Factory New)|Mil-Spec|578|CZ75-Auto|0.38|0.33|76.00
SG 553 | Bulldozer (Factory New)|Restricted|579|SG 553|0.15|0.35|110.00
Dual Berettas | Duelist (Factory New)|Restricted|580|Dual Berettas|0.75|0.04|55.00
Glock-18 | Twilight Galaxy (Factory New)|Classified|581|Glock-18|0.53|0.16|63.00
M4A1-S | Hot Rod (Factory New)|Classified|582|M4A1-S|0.01|0.50|66.00
MP7 | Asterion (Factory New)|Consumer Grade|583|MP7|0.59|0.69|124.00
AUG | Daedalus (Factory New)|Consumer Grade|584|AUG|0.06|0.15|81.00
Dual Berettas | Moon in Libra (Factory New)|Consumer Grade|585|Dual Berettas|0.64|0.44|71.00
Nova | Moon in Libra (Factory New)|Consumer Grade|586|Nova|0.63|0.45|80.00
Tec-9 | Hades (Factory New)|Industrial Grade|587|Tec-9|0.14|0.12|145.00
P2000 | Pathfinder (Factory New)|Industrial Grade|588|P2000|0.12|0.09|90.00
AWP | Sun in Leo (Factory New)|Industrial Grade|589|AWP|0.66|0.34|90.00
M249 | Shipping Forecast (Factory New)|Industrial Grade|590|M249|0.51|0.38|71.00
UMP-45 | Minotaur's Labyrinth (Factory New)|Mil-Spec|591|UMP-45|0.69|0.20|91.00
MP9 | Pandora's Box (Factory New)|Mil-Spec|592|MP9|0.60|0.33|84.00
G3SG1 | Chronos (Factory New)|Restricted|593|G3SG1|0.61|0.08|74.00
M4A1-S | Icarus Fell (Factory New)|Restricted|594|M4A1-S|0.54|0.58|105.00
M4A4 | Poseidon (Factory New)|Classified|595|M4A4|0.50|0.35|89.00
AWP | Medusa (Factory New)|Covert|596|AWP|0.50|0.06|52.00
PP-Bizon | Bamboo Print (Factory New)|Consumer Grade|597|PP-Bizon|0.13|0.17|157.00
Sawed-Off | Bamboo Shadow (Factory New)|Consumer Grade|598|Sawed-Off|0.10|0.13|54.00
Tec-9 | Bamboo Forest (Factory New)|Consumer Grade|599|Tec-9|0.16|0.21|141.00
G3SG1 | Orange Kimono (Factory New)|Consumer Grade|600|G3SG1|0.10|0.39|90.00
P250 | Mint Kimono (Factory New)|Consumer Grade|601|P250|0.40|0.08|144.00
P250 | Crimson Kimono (Factory New)|Industrial Grade|602|P250|0.02|0.19|86.00
Desert Eagle | Midnight Storm (Factory New)|Industrial Grade|603|Desert Eagle|0.50|0.34|68.00
Galil AR | Aqua Terrace (Factory New)|Mil-Spec|604|Galil AR|0.47|0.26|81.00
MAG-7 | Counter Terrace (Factory New)|Mil-Spec|605|MAG-7|0.22|0.35|119.00
Tec-9 | Terrace (Factory New)|Mil-Spec|606|Tec-9|0.13|0.51|171.00
Five-SeveN | Neon Kimono (Factory New)|Restricted|607|Five-SeveN|0.17|0.41|170.00
Desert Eagle | Sunset Storm 壱 (Factory New)|Restricted|608|Desert Eagle|0.02|0.67|82.00
Desert Eagle | Sunset Storm 弐 (Factory New)|Restricted|609|Desert Eagle|0.02|0.67|81.00
M4A4 | Daybreak (Factory New)|Restricted|610|M4A4|0.12|0.23|93.00
AK-47 | Hydroponic (Factory New)|Classified|611|AK-47|0.13|0.39|89.00
AUG | Akihabara Accept (Factory New)|Covert|612|AUG|0.73|0.13|103.00
★ Falchion Knife | Vanilla (Factory New)|Covert|613|Falchion Knife|0.57|0.09|74.00
★ Falchion Knife | Blue Steel (Factory New)|Covert|614|Falchion Knife|0.58|0.22|59.00
★ Falchion Knife | Boreal Forest (Factory New)|Covert|615|Falchion Knife|0.24|0.24|122.00
★ Falchion Knife | Case Hardened (Factory New)|Covert|616|Falchion Knife|0.14|0.16|117.00
★ Falchion Knife | Crimson Web (Factory New)|Covert|617|Falchion Knife|0.01|0.54|136.00
★ Falchion Knife | Fade (Factory New)|Covert|618|Falchion Knife|0.03|0.30|106.00
★ Falchion Knife | Forest DDPAT (Factory New)|Covert|619|Falchion Knife|0.15|0.21|124.00
★ Falchion Knife | Night (Factory New)|Covert|620|Falchion Knife|0.58|0.07|82.00
★ Falchion Knife | Safari Mesh (Factory New)|Covert|621|Falchion Knife|0.18|0.20|123.00
★ Falchion Knife | Scorched (Factory New)|Covert|622|Falchion Knife|0.10|0.08|90.00
★ Falchion Knife | Slaughter (Factory New)|Covert|623|Falchion Knife|0.99|0.48|130.00
★ Falchion Knife | Stained (Factory New)|Covert|624|Falchion Knife|0.56|0.10|93.00
★ Falchion Knife | Urban Masked (Factory New)|Covert|625|Falchion Knife|0.27|0.03|178.00
Dual Berettas | Dualing Dragons (Factory New)|Mil-Spec|626|Dual Berettas|0.05|0.31|70.00
FAMAS | Survivor Z (Factory New)|Mil-Spec|627|FAMAS|0.03|0.34|111.00
Glock-18 | Wraiths (Factory New)|Mil-Spec|628|Glock-18|0.10|0.15|66.00
MAC-10 | Rangeen (Factory New)|Mil-Spec|629|MAC-10|0.09|0.22|133.00
MAG-7 | Cobalt Core (Factory New)|Mil-Spec|630|MAG-7|0.53|0.48|106.00
SCAR-20 | Green Marine (Factory New)|Mil-Spec|631|SCAR-20|0.19|0.15|55.00
XM1014 | Scumbria (Factory New)|Mil-Spec|632|XM1014|0.46|0.05|75.00
Galil AR | Stone Cold (Factory New)|Restricted|633|Galil AR|0.56|0.40|65.00
M249 | Nebula Crusader (Factory New)|Restricted|634|M249|0.05|0.18|78.00
MP7 | Special Delivery (Factory New)|Restricted|635|MP7|0.10|0.18|114.00
P250 | Wingshot (Factory New)|Restricted|636|P250|0.17|0.39|131.00
AK-47 | Frontside Misty (Factory New)|Classified|637|AK-47|0.49|0.29|110.00
G3SG1 | Flux (Factory New)|Classified|638|G3SG1|0.71|0.20|54.00
SSG 08 | Big Iron (Factory New)|Classified|639|SSG 08|0.10|0.36|80.00
M4A1-S | Golden Coil (Factory New)|Covert|640|M4A1-S|0.10|0.60|124.00
USP-S | Kill Confirmed (Factory New)|Covert|641|USP-S|0.04|0.37|123.00
★ Shadow Daggers | Vanilla (Factory New)|Covert|642|Shadow Daggers|0.57|0.16|31.00
★ Shadow Daggers | Blue Steel (Factory New)|Covert|643|Shadow Daggers|0.58|0.23|142.00
★ Shadow Daggers | Boreal Forest (Factory New)|Covert|644|Shadow Daggers|0.18|0.13|104.00
★ Shadow Daggers | Case Hardened (Factory New)|Covert|645|Shadow Daggers|0.29|0.05|175.00
★ Shadow Daggers | Crimson Web (Factory New)|Covert|646|Shadow Daggers|0.01|0.25|108.00
★ Shadow Daggers | Fade (Factory New)|Covert|647|Shadow Daggers|0.95|0.38|203.00
★ Shadow Daggers | Forest DDPAT (Factory New)|Covert|648|Shadow Daggers|0.25|0.22|103.00
★ Shadow Daggers | Night (Factory New)|Covert|649|Shadow Daggers|0.56|0.18|83.00
★ Shadow Daggers | Safari Mesh (Factory New)|Covert|650|Shadow Daggers|0.19|0.16|103.00
★ Shadow Daggers | Scorched (Factory New)|Covert|651|Shadow Daggers|0.10|0.05|164.00
★ Shadow Daggers | Slaughter (Factory New)|Covert|652|Shadow Daggers|0.99|0.37|205.00
★ Shadow Daggers | Stained (Factory New)|Covert|653|Shadow Daggers|0.57|0.11|160.00
★ Shadow Daggers | Urban Masked (Factory New)|Covert|654|Shadow Daggers|0.47|0.03|155.00
R8 Revolver | Fade (Factory New)|Covert|655|R8 Revolver|0.06|0.36|87.00
M4A4 | Royal Paladin (Factory New)|Covert|656|M4A4|0.11|0.18|83.00
R8 Revolver | Crimson Web (Factory New)|Mil-Spec|657|R8 Revolver|0.01|0.53|102.00
AUG | Ricochet (Factory New)|Mil-Spec|658|AUG|0.44|0.16|89.00
Desert Eagle | Corinthian (Factory New)|Mil-Spec|659|Desert Eagle|0.07|0.42|52.00
P2000 | Imperial (Factory New)|Mil-Spec|660|P2000|0.01|0.49|80.00
Sawed-Off | Yorick (Factory New)|Mil-Spec|661|Sawed-Off|0.08|0.37|70.00
SCAR-20 | Outbreak (Factory New)|Mil-Spec|662|SCAR-20|0.21|0.26|80.00
PP-Bizon | Fuel Rod (Factory New)|Restricted|663|PP-Bizon|0.28|0.32|72.00
Negev | Power Loader (Factory New)|Restricted|664|Negev|0.17|0.43|111.00
Five-SeveN | Retrobution (Factory New)|Restricted|665|Five-SeveN|0.08|0.29|168.00
SG 553 | Tiger Moth (Factory New)|Restricted|666|SG 553|0.06|0.46|95.00
Tec-9 | Avalanche (Factory New)|Restricted|667|Tec-9|0.45|0.13|108.00
XM1014 | Teclu Burner (Factory New)|Restricted|668|XM1014|0.12|0.29|83.00
AK-47 | Point Disarray (Factory New)|Classified|669|AK-47|0.93|0.09|98.00
P90 | Shapewood (Factory New)|Classified|670|P90|0.11|0.37|142.00
R8 Revolver | Amber Fade (Factory New)|Classified|672|R8 Revolver|0.13|0.21|71.00
Souvenir R8 Revolver | Amber Fade (Factory New)|Classified|672|R8 Revolver|0.13|0.21|71.00
R8 Revolver | Bone Mask (Factory New)|Consumer Grade|673|R8 Revolver|0.14|0.20|109.00
Souvenir R8 Revolver | Bone Mask (Factory New)|Consumer Grade|673|R8 Revolver|0.14|0.20|109.00
PP-Bizon | Photic Zone (Factory New)|Mil-Spec|674|PP-Bizon|0.38|0.27|103.00
Dual Berettas | Cartel (Factory New)|Mil-Spec|675|Dual Berettas|0.10|0.24|94.00
MAC-10 | Lapis Gator (Factory New)|Mil-Spec|676|MAC-10|0.60|0.14|92.00
SSG 08 | Necropos (Factory New)|Mil-Spec|677|SSG 08|0.14|0.19|73.00
Tec-9 | Jambiya (Factory New)|Mil-Spec|678|Tec-9|0.14|0.13|89.00
USP-S | Lead Conduit (Factory New)|Mil-Spec|679|USP-S|0.12|0.18|57.00
FAMAS | Valence (Factory New)|Restricted|680|FAMAS|0.04|0.23|66.00
Five-SeveN | Triumvirate (Factory New)|Restricted|681|Five-SeveN|0.14|0.15|115.00
Glock-18 | Royal Legion (Factory New)|Restricted|682|Glock-18|0.04|0.51|103.00
MAG-7 | Praetorian (Factory New)|Restricted|683|MAG-7|0.17|0.06|35.00
MP7 | Impire (Factory New)|Restricted|684|MP7|0.20|0.41|143.00
AWP | Elite Build (Factory New)|Classified|685|AWP|0.10|0.10|51.00
Desert Eagle | Kumicho Dragon (Factory New)|Classified|686|Desert Eagle|0.48|0.10|81.00
Nova | Hyper Beast (Factory New)|Classified|687|Nova|0.93|0.08|88.00
AK-47 | Fuel Injector (Factory New)|Covert|688|AK-47|0.10|0.32|76.00
M4A4 | The Battlestar (Factory New)|Covert|689|M4A4|0.14|0.21|77.00
★ Bowie Knife | Vanilla (Factory New)|Covert|690|Bowie Knife|0.39|0.04|77.00
★ Bowie Knife | Blue Steel (Factory New)|Covert|691|Bowie Knife|0.58|0.23|66.00
★ Bowie Knife | Boreal Forest (Factory New)|Covert|692|Bowie Knife|0.27|0.20|109.00
★ Bowie Knife | Case Hardened (Factory New)|Covert|693|Bowie Knife|0.29|0.04|111.00
★ Bowie Knife | Crimson Web (Factory New)|Covert|694|Bowie Knife|0.00|0.39|109.00
★ Bowie Knife | Fade (Factory New)|Covert|695|Bowie Knife|0.00|0.36|110.00
★ Bowie Knife | Forest DDPAT (Factory New)|Covert|696|Bowie Knife|0.19|0.19|104.00
★ Bowie Knife | Night (Factory New)|Covert|697|Bowie Knife|0.58|0.13|78.00
★ Bowie Knife | Safari Mesh (Factory New)|Covert|698|Bowie Knife|0.17|0.19|112.00
★ Bowie Knife | Scorched (Factory New)|Covert|699|Bowie Knife|0.08|0.04|99.00
★ Bowie Knife | Slaughter (Factory New)|Covert|700|Bowie Knife|0.99|0.45|126.00
★ Bowie Knife | Stained (Factory New)|Covert|701|Bowie Knife|0.57|0.10|96.00
★ Bowie Knife | Urban Masked (Factory New)|Covert|702|Bowie Knife|0.44|0.04|154.00
AUG | Fleet Flock (Factory New)|Classified|703|AUG|0.21|0.16|118.00
PP-Bizon | Judgement of Anubis (Factory New)|Covert|704|PP-Bizon|0.11|0.32|81.00
CZ75-Auto | Red Astor (Factory New)|Restricted|705|CZ75-Auto|0.03|0.23|65.00
Dual Berettas | Ventilators (Factory New)|Mil-Spec|706|Dual Berettas|0.17|0.07|67.00
G3SG1 | Orange Crash (Factory New)|Mil-Spec|707|G3SG1|0.07|0.52|118.00
Galil AR | Firefight (Factory New)|Restricted|708|Galil AR|0.03|0.35|96.00
M249 | Spectre (Factory New)|Mil-Spec|709|M249|0.12|0.19|112.00
M4A1-S | Chantico's Fire (Factory New)|Covert|710|M4A1-S|0.10|0.50|153.00
MP9 | Bioleak (Factory New)|Mil-Spec|711|MP9|0.15|0.41|63.00
P2000 | Oceanic (Factory New)|Mil-Spec|712|P2000|0.58|0.54|105.00
SG 553 | Atlas (Factory New)|Mil-Spec|715|SG 553|0.18|0.24|59.00
SSG 08 | Ghost Crusader (Factory New)|Restricted|716|SSG 08|0.47|0.06|82.00
Tec-9 | Re-Entry (Factory New)|Restricted|717|Tec-9|0.03|0.20|76.00
UMP-45 | Primal Saber (Factory New)|Classified|718|UMP-45|0.42|0.13|116.00
XM1014 | Black Tie (Factory New)|Restricted|719|XM1014|0.14|0.07|94.00
M4A1-S | Mecha Industries (Factory New)|Covert|720|M4A1-S|0.13|0.14|132.00
Glock-18 | Wasteland Rebel (Factory New)|Covert|721|Glock-18|0.12|0.12|118.00
SCAR-20 | Bloodsport (Factory New)|Classified|722|SCAR-20|0.07|0.31|95.00
P2000 | Imperial Dragon (Factory New)|Classified|723|P2000|0.05|0.64|100.00
M4A4 | Desolate Space (Factory New)|Classified|724|M4A4|0.67|0.17|123.00
Sawed-Off | Limelight (Factory New)|Restricted|725|Sawed-Off|0.19|0.26|102.00
R8 Revolver | Reboot (Factory New)|Restricted|726|R8 Revolver|0.10|0.10|79.00
P90 | Chopper (Factory New)|Restricted|727|P90|0.06|0.25|52.00
AWP | Phobos (Factory New)|Restricted|728|AWP|0.14|0.19|57.00
AUG | Aristocrat (Factory New)|Restricted|729|AUG|0.50|0.03|66.00
Tec-9 | Ice Cap (Factory New)|Mil-Spec|730|Tec-9|0.57|0.12|74.00
SG 553 | Aerial (Factory New)|Mil-Spec|731|SG 553|0.12|0.22|82.00
PP-Bizon | Harvester (Factory New)|Mil-Spec|732|PP-Bizon|0.17|0.15|47.00
P250 | Iron Clad (Factory New)|Mil-Spec|733|P250|0.21|0.29|49.00
Nova | Exo (Factory New)|Mil-Spec|734|Nova|0.17|0.03|67.00
MAC-10 | Carnivore (Factory New)|Mil-Spec|735|MAC-10|0.04|0.32|111.00
Five-SeveN | Violent Daimyo (Factory New)|Mil-Spec|736|Five-SeveN|0.84|0.34|87.00
★ Bayonet | Lore (Factory New)|Covert|737|Bayonet|0.13|0.49|163.00
★ Flip Knife | Lore (Factory New)|Covert|738|Flip Knife|0.13|0.46|125.00
★ Gut Knife | Lore (Factory New)|Covert|739|Gut Knife|0.15|0.48|145.00
★ Karambit | Lore (Factory New)|Covert|740|Karambit|0.15|0.44|120.00
★ M9 Bayonet | Lore (Factory New)|Covert|741|M9 Bayonet|0.13|0.48|146.00
★ Bayonet | Black Laminate (Factory New)|Covert|742|Bayonet|0.20|0.04|115.00
★ Flip Knife | Black Laminate (Factory New)|Covert|743|Flip Knife|0.15|0.09|89.00
★ Gut Knife | Black Laminate (Factory New)|Covert|744|Gut Knife|0.23|0.05|111.00
★ Karambit | Black Laminate (Factory New)|Covert|745|Karambit|0.22|0.05|129.00
★ M9 Bayonet | Black Laminate (Factory New)|Covert|746|M9 Bayonet|0.33|0.03|104.00
★ Bayonet | Autotronic (Factory New)|Covert|752|Bayonet|1.00|0.26|131.00
★ Flip Knife | Autotronic (Factory New)|Covert|753|Flip Knife|0.04|0.12|100.00
★ Gut Knife | Autotronic (Factory New)|Covert|754|Gut Knife|0.01|0.14|112.00
★ Karambit | Autotronic (Factory New)|Covert|755|Karambit|0.00|0.13|99.00
★ M9 Bayonet | Autotronic (Factory New)|Covert|756|M9 Bayonet|0.99|0.13|113.00
★ Bayonet | Bright Water (Factory New)|Covert|757|Bayonet|0.60|0.41|145.00
★ Flip Knife | Bright Water (Factory New)|Covert|758|Flip Knife|0.60|0.42|125.00
★ Gut Knife | Bright Water (Factory New)|Covert|759|Gut Knife|0.60|0.45|146.00
★ Karambit | Bright Water (Factory New)|Covert|760|Karambit|0.60|0.35|110.00
★ M9 Bayonet | Bright Water (Factory New)|Covert|761|M9 Bayonet|0.60|0.44|137.00
★ Bayonet | Freehand (Factory New)|Covert|762|Bayonet|0.17|0.01|143.00
★ Flip Knife | Freehand (Factory New)|Covert|763|Flip Knife|0.28|0.03|107.00
★ Gut Knife | Freehand (Factory New)|Covert|764|Gut Knife|0.97|0.20|123.00
★ Karambit | Freehand (Factory New)|Covert|765|Karambit|0.65|0.07|111.00
★ M9 Bayonet | Freehand (Factory New)|Covert|766|M9 Bayonet|0.70|0.14|112.00
AK-47 | Neon Revolution (Factory New)|Covert|767|AK-47|0.96|0.37|106.00
AUG | Syd Mead (Factory New)|Classified|768|AUG|0.06|0.17|70.00
CZ75-Auto | Imprint (Factory New)|Mil-Spec|769|CZ75-Auto|0.17|0.08|105.00
Desert Eagle | Directive (Factory New)|Restricted|770|Desert Eagle|0.50|0.08|36.00
FAMAS | Roll Cage (Factory New)|Covert|771|FAMAS|0.04|0.31|78.00
Five-SeveN | Scumbria (Factory New)|Mil-Spec|772|Five-SeveN|0.33|0.03|65.00
G3SG1 | Ventilator (Factory New)|Mil-Spec|773|G3SG1|0.21|0.08|51.00
Glock-18 | Weasel (Factory New)|Restricted|774|Glock-18|0.07|0.32|116.00
MAG-7 | Petroglyph (Factory New)|Restricted|775|MAG-7|0.09|0.19|85.00
MP9 | Airlock (Factory New)|Classified|776|MP9|0.08|0.23|132.00
P90 | Grim (Factory New)|Mil-Spec|778|P90|0.31|0.19|97.00
SCAR-20 | Powercore (Factory New)|Restricted|779|SCAR-20|0.17|0.30|57.00
SG 553 | Triarch (Factory New)|Restricted|780|SG 553|0.10|0.28|88.00
Tec-9 | Fuel Injector (Factory New)|Classified|781|Tec-9|0.12|0.48|102.00
UMP-45 | Briefing (Factory New)|Mil-Spec|782|UMP-45|0.08|0.05|83.00
XM1014 | Slipstream (Factory New)|Mil-Spec|783|XM1014|0.50|0.35|110.00
CZ75-Auto | Polymer (Factory New)|Mil-Spec|784|CZ75-Auto|0.37|0.07|71.00
Glock-18 | Ironwork (Factory New)|Mil-Spec|785|Glock-18|0.17|0.08|76.00
MP7 | Cirrus (Factory New)|Mil-Spec|786|MP7|0.56|0.47|72.00
Galil AR | Black Sand (Factory New)|Mil-Spec|787|Galil AR|0.11|0.20|83.00
MP9 | Sand Scale (Factory New)|Mil-Spec|788|MP9|0.12|0.16|91.00
MAG-7 | Sonar (Factory New)|Mil-Spec|789|MAG-7|0.30|0.07|69.00
P2000 | Turf (Factory New)|Mil-Spec|790|P2000|0.21|0.29|90.00
Dual Berettas | Royal Consorts (Factory New)|Restricted|791|Dual Berettas|0.17|0.22|60.00
G3SG1 | Stinger (Factory New)|Restricted|792|G3SG1|0.16|0.23|77.00
M4A1-S | Flashback (Factory New)|Restricted|793|M4A1-S|0.13|0.24|98.00
Nova | Gila (Factory New)|Restricted|794|Nova|0.12|0.13|55.00
USP-S | Cyrex (Factory New)|Restricted|795|USP-S|0.04|0.16|90.00
FAMAS | Mecha Industries (Factory New)|Classified|796|FAMAS|0.11|0.15|144.00
P90 | Shallow Grave (Factory New)|Classified|797|P90|0.92|0.05|39.00
Sawed-Off | Wasteland Princess (Factory New)|Classified|798|Sawed-Off|0.99|0.19|129.00
SSG 08 | Dragonfire (Factory New)|Covert|799|SSG 08|0.06|0.43|87.00
M4A4 | Buzz Kill (Factory New)|Covert|800|M4A4|0.12|0.40|89.00
PP-Bizon | Jungle Slipstream (Factory New)|Mil-Spec|801|PP-Bizon|0.17|0.32|90.00
SCAR-20 | Blueprint (Factory New)|Mil-Spec|802|SCAR-20|0.60|0.41|79.00
Desert Eagle | Oxide Blaze (Factory New)|Mil-Spec|803|Desert Eagle|0.10|0.18|92.00
Five-SeveN | Capillary (Factory New)|Mil-Spec|804|Five-SeveN|0.17|0.07|84.00
MP7 | Akoben (Factory New)|Mil-Spec|805|MP7|0.19|0.40|137.00
P250 | Ripple (Factory New)|Mil-Spec|806|P250|0.49|0.24|67.00
Sawed-Off | Zander (Factory New)|Mil-Spec|807|Sawed-Off|0.08|0.31|71.00
Galil AR | Crimson Tsunami (Factory New)|Restricted|808|Galil AR|0.08|0.32|126.00
M249 | Emerald Poison Dart (Factory New)|Restricted|809|M249|0.25|0.21|95.00
MAC-10 | Last Dive (Factory New)|Restricted|810|MAC-10|0.09|0.21|81.00
UMP-45 | Scaffold (Factory New)|Restricted|811|UMP-45|0.48|0.42|99.00
XM1014 | Seasons (Factory New)|Restricted|812|XM1014|0.07|0.36|95.00
AWP | Fever Dream (Factory New)|Classified|813|AWP|0.94|0.12|75.00
CZ75-Auto | Xiangliu (Factory New)|Classified|814|CZ75-Auto|0.95|0.29|76.00
M4A1-S | Decimator (Factory New)|Classified|815|M4A1-S|0.65|0.24|49.00
AK-47 | Bloodsport (Factory New)|Covert|816|AK-47|0.04|0.39|76.00
USP-S | Neo-Noir (Factory New)|Covert|817|USP-S|0.94|0.09|92.00
★ Bowie Knife | Damascus Steel (Factory New)|Covert|818|Bowie Knife|0.55|0.10|115.00
★ Bowie Knife | Marble Fade (Factory New)|Covert|820|Bowie Knife|0.98|0.29|80.00
★ Bowie Knife | Tiger Tooth (Factory New)|Covert|821|Bowie Knife|0.10|0.66|140.00
★ Bowie Knife | Ultraviolet (Factory New)|Covert|823|Bowie Knife|0.68|0.13|79.00
★ Butterfly Knife | Damascus Steel (Factory New)|Covert|824|Butterfly Knife|0.56|0.10|86.00
★ Butterfly Knife | Marble Fade (Factory New)|Covert|826|Butterfly Knife|0.00|0.31|64.00
★ Butterfly Knife | Tiger Tooth (Factory New)|Covert|827|Butterfly Knife|0.09|0.56|93.00
★ Butterfly Knife | Ultraviolet (Factory New)|Covert|829|Butterfly Knife|0.68|0.18|66.00
★ Falchion Knife | Damascus Steel (Factory New)|Covert|830|Falchion Knife|0.55|0.09|114.00
★ Falchion Knife | Marble Fade (Factory New)|Covert|832|Falchion Knife|0.02|0.27|77.00
★ Falchion Knife | Tiger Tooth (Factory New)|Covert|833|Falchion Knife|0.09|0.67|155.00
★ Falchion Knife | Ultraviolet (Factory New)|Covert|835|Falchion Knife|0.77|0.28|78.00
★ Huntsman Knife | Damascus Steel (Factory New)|Covert|836|Huntsman Knife|0.55|0.08|130.00
★ Huntsman Knife | Marble Fade (Factory New)|Covert|838|Huntsman Knife|0.95|0.19|113.00
★ Huntsman Knife | Tiger Tooth (Factory New)|Covert|839|Huntsman Knife|0.12|0.63|162.00
★ Huntsman Knife | Ultraviolet (Factory New)|Covert|841|Huntsman Knife|0.74|0.24|74.00
★ Shadow Daggers | Damascus Steel (Factory New)|Covert|842|Shadow Daggers|0.56|0.08|177.00
★ Shadow Daggers | Marble Fade (Factory New)|Covert|844|Shadow Daggers|0.05|0.42|187.00
★ Shadow Daggers | Tiger Tooth (Factory New)|Covert|845|Shadow Daggers|0.12|0.64|216.00
★ Shadow Daggers | Ultraviolet (Factory New)|Covert|847|Shadow Daggers|0.74|0.32|130.00
USP-S | Blueprint (Factory New)|Mil-Spec|848|USP-S|0.60|0.49|92.00
FAMAS | Macabre (Factory New)|Mil-Spec|849|FAMAS|0.14|0.29|109.00
M4A1-S | Briefing (Factory New)|Mil-Spec|850|M4A1-S|0.00|0.05|81.00
MAC-10 | Aloha (Factory New)|Mil-Spec|851|MAC-10|0.09|0.21|98.00
MAG-7 | Hard Water (Factory New)|Mil-Spec|852|MAG-7|0.51|0.18|67.00
Tec-9 | Cut Out (Factory New)|Mil-Spec|853|Tec-9|0.22|0.04|69.00
UMP-45 | Metal Flowers (Factory New)|Mil-Spec|854|UMP-45|0.17|0.03|65.00
AK-47 | Orbit Mk01 (Factory New)|Restricted|855|AK-47|0.03|0.30|57.00
P2000 | Woodsman (Factory New)|Restricted|856|P2000|0.09|0.38|108.00
P250 | Red Rock (Factory New)|Restricted|857|P250|0.08|0.34|125.00
P90 | Death Grip (Factory New)|Restricted|858|P90|0.15|0.07|115.00
SSG 08 | Death's Head (Factory New)|Restricted|859|SSG 08|0.08|0.32|74.00
Dual Berettas | Cobra Strike (Factory New)|Classified|860|Dual Berettas|0.21|0.39|66.00
Galil AR | Sugar Rush (Factory New)|Classified|861|Galil AR|0.76|0.32|129.00
M4A4 | Hellfire (Factory New)|Classified|862|M4A4|0.06|0.39|106.00
Five-SeveN | Hyper Beast (Factory New)|Covert|863|Five-SeveN|0.94|0.22|119.00
AWP | Oni Taiji (Factory New)|Covert|864|AWP|0.00|0.22|76.00
Sawed-Off | Morris (Factory New)|Mil-Spec|865|Sawed-Off|0.08|0.32|82.00
AUG | Triqua (Factory New)|Mil-Spec|866|AUG|0.07|0.16|73.00
G3SG1 | Hunter (Factory New)|Mil-Spec|867|G3SG1|0.07|0.25|64.00
Glock-18 | Off World (Factory New)|Mil-Spec|868|Glock-18|0.55|0.34|96.00
MAC-10 | Oceanic (Factory New)|Mil-Spec|869|MAC-10|0.49|0.12|96.00
Tec-9 | Cracked Opal (Factory New)|Mil-Spec|870|Tec-9|0.10|0.42|88.00
SCAR-20 | Jungle Slipstream (Factory New)|Mil-Spec|871|SCAR-20|0.16|0.41|91.00
MP9 | Goo (Factory New)|Restricted|872|MP9|0.53|0.06|83.00
SG 553 | Phantom (Factory New)|Restricted|873|SG 553|0.00|0.00|64.00
CZ75-Auto | Tacticat (Factory New)|Restricted|874|CZ75-Auto|0.80|0.11|88.00
UMP-45 | Exposure (Factory New)|Restricted|875|UMP-45|0.54|0.40|109.00
XM1014 | Ziggy (Factory New)|Restricted|876|XM1014|0.13|0.13|76.00
PP-Bizon | High Roller (Factory New)|Classified|877|PP-Bizon|0.03|0.27|113.00
M4A1-S | Leaded Glass (Factory New)|Classified|878|M4A1-S|0.08|0.27|79.00
R8 Revolver | Llama Cannon (Factory New)|Classified|879|R8 Revolver|0.58|0.04|55.00
AK-47 | The Empress (Factory New)|Covert|880|AK-47|0.05|0.22|58.00
P250 | See Ya Later (Factory New)|Covert|881|P250|0.29|0.28|109.00
PP-Bizon | Night Riot (Factory New)|Mil-Spec|882|PP-Bizon|0.33|0.05|62.00
Five-SeveN | Flame Test (Factory New)|Mil-Spec|883|Five-SeveN|0.00|0.02|56.00
MP9 | Black Sand (Factory New)|Mil-Spec|884|MP9|0.11|0.25|77.00
P2000 | Urban Hazard (Factory New)|Mil-Spec|885|P2000|0.05|0.22|105.00
R8 Revolver | Grip (Factory New)|Mil-Spec|886|R8 Revolver|0.50|0.07|68.00
SG 553 | Aloha (Factory New)|Mil-Spec|887|SG 553|0.63|0.24|80.00
XM1014 | Oxide Blaze (Factory New)|Mil-Spec|888|XM1014|0.07|0.21|66.00
Glock-18 | Moonrise (Factory New)|Restricted|889|Glock-18|0.78|0.16|79.00
Negev | Lionfish (Factory New)|Restricted|890|Negev|0.05|0.43|118.00
Nova | Wild Six (Factory New)|Restricted|891|Nova|0.08|0.37|81.00
MAG-7 | SWAG-7 (Factory New)|Restricted|892|MAG-7|0.25|0.03|63.00
UMP-45 | Arctic Wolf (Factory New)|Restricted|893|UMP-45|0.14|0.06|108.00
AUG | Stymphalian (Factory New)|Classified|894|AUG|0.10|0.33|89.00
AWP | Mortis (Factory New)|Classified|895|AWP|0.08|0.30|67.00
USP-S | Cortex (Factory New)|Classified|896|USP-S|0.99|0.28|128.00
M4A4 | Neo-Noir (Factory New)|Covert|897|M4A4|0.93|0.08|92.00
MP7 | Bloodsport (Factory New)|Covert|898|MP7|0.06|0.39|98.00
AUG | Amber Slipstream (Factory New)|Mil-Spec|899|AUG|0.09|0.26|97.00
Dual Berettas | Shred (Factory New)|Mil-Spec|900|Dual Berettas|0.54|0.13|71.00
Glock-18 | Warhawk (Factory New)|Mil-Spec|901|Glock-18|0.11|0.22|76.00
MP9 | Capillary (Factory New)|Mil-Spec|902|MP9|0.12|0.10|78.00
P90 | Traction (Factory New)|Mil-Spec|903|P90|0.52|0.20|54.00
R8 Revolver | Survivalist (Factory New)|Mil-Spec|904|R8 Revolver|0.20|0.20|91.00
Tec-9 | Snek-9 (Factory New)|Mil-Spec|905|Tec-9|0.09|0.20|80.00
CZ75-Auto | Eco (Factory New)|Restricted|906|CZ75-Auto|0.24|0.41|165.00
G3SG1 | High Seas (Factory New)|Restricted|907|G3SG1|0.10|0.36|73.00
Nova | Toy Soldier (Factory New)|Restricted|908|Nova|0.24|0.40|107.00
AWP | PAW (Factory New)|Restricted|909|AWP|0.10|0.17|70.00
MP7 | Powercore (Factory New)|Restricted|910|MP7|0.25|0.42|85.00
M4A1-S | Nightmare (Factory New)|Classified|911|M4A1-S|0.55|0.32|88.00
Sawed-Off | Devourer (Factory New)|Classified|912|Sawed-Off|0.10|0.30|122.00
FAMAS | Eye of Athena (Factory New)|Classified|913|FAMAS|0.07|0.35|79.00
AK-47 | Neon Rider (Factory New)|Covert|914|AK-47|0.73|0.28|102.00
Desert Eagle | Code Red (Factory New)|Covert|915|Desert Eagle|0.01|0.44|95.00
★ Stiletto Knife | Vanilla (Factory New)|Covert|916|Stiletto Knife|0.17|0.01|103.00
★ Stiletto Knife | Blue Steel (Factory New)|Covert|917|Stiletto Knife|0.62|0.06|63.00
★ Stiletto Knife | Boreal Forest (Factory New)|Covert|918|Stiletto Knife|0.18|0.19|112.00
★ Stiletto Knife | Case Hardened (Factory New)|Covert|919|Stiletto Knife|0.12|0.14|100.00
★ Stiletto Knife | Crimson Web (Factory New)|Covert|920|Stiletto Knife|0.01|0.44|116.00
★ Stiletto Knife | Fade (Factory New)|Covert|921|Stiletto Knife|0.04|0.27|102.00
★ Stiletto Knife | Forest DDPAT (Factory New)|Covert|922|Stiletto Knife|0.22|0.23|113.00
★ Stiletto Knife | Night Stripe (Factory New)|Covert|923|Stiletto Knife|0.56|0.23|81.00
★ Stiletto Knife | Safari Mesh (Factory New)|Covert|924|Stiletto Knife|0.18|0.18|113.00
★ Stiletto Knife | Scorched (Factory New)|Covert|925|Stiletto Knife|0.12|0.05|87.00
★ Stiletto Knife | Slaughter (Factory New)|Covert|926|Stiletto Knife|0.00|0.43|114.00
★ Stiletto Knife | Stained (Factory New)|Covert|927|Stiletto Knife|0.00|0.01|84.00
★ Stiletto Knife | Urban Masked (Factory New)|Covert|928|Stiletto Knife|0.40|0.03|167.00
★ Ursus Knife | Vanilla (Factory New)|Covert|929|Ursus Knife|0.15|0.11|92.00
★ Ursus Knife | Blue Steel (Factory New)|Covert|930|Ursus Knife|0.52|0.11|89.00
★ Ursus Knife | Boreal Forest (Factory New)|Covert|931|Ursus Knife|0.17|0.16|107.00
★ Ursus Knife | Case Hardened (Factory New)|Covert|932|Ursus Knife|0.15|0.14|122.00
★ Ursus Knife | Crimson Web (Factory New)|Covert|933|Ursus Knife|0.00|0.34|104.00
★ Ursus Knife | Fade (Factory New)|Covert|934|Ursus Knife|0.03|0.29|129.00
★ Ursus Knife | Forest DDPAT (Factory New)|Covert|935|Ursus Knife|0.24|0.25|112.00
★ Ursus Knife | Night Stripe (Factory New)|Covert|936|Ursus Knife|0.56|0.24|80.00
★ Ursus Knife | Safari Mesh (Factory New)|Covert|937|Ursus Knife|0.19|0.18|111.00
★ Ursus Knife | Scorched (Factory New)|Covert|938|Ursus Knife|0.10|0.05|104.00
★ Ursus Knife | Slaughter (Factory New)|Covert|939|Ursus Knife|0.02|0.35|140.00
★ Ursus Knife | Stained (Factory New)|Covert|940|Ursus Knife|0.33|0.04|113.00
★ Ursus Knife | Urban Masked (Factory New)|Covert|941|Ursus Knife|0.42|0.04|163.00
★ Navaja Knife | Vanilla (Factory New)|Covert|942|Navaja Knife|0.06|0.12|153.00
★ Navaja Knife | Blue Steel (Factory New)|Covert|943|Navaja Knife|0.08|0.15|99.00
★ Navaja Knife | Boreal Forest (Factory New)|Covert|944|Navaja Knife|0.17|0.19|117.00
★ Navaja Knife | Case Hardened (Factory New)|Covert|945|Navaja Knife|0.09|0.28|158.00
★ Navaja Knife | Crimson Web (Factory New)|Covert|946|Navaja Knife|0.01|0.43|122.00
★ Navaja Knife | Fade (Factory New)|Covert|947|Navaja Knife|0.03|0.40|152.00
★ Navaja Knife | Forest DDPAT (Factory New)|Covert|948|Navaja Knife|0.22|0.24|122.00
★ Navaja Knife | Night Stripe (Factory New)|Covert|949|Navaja Knife|0.56|0.22|87.00
★ Navaja Knife | Safari Mesh (Factory New)|Covert|950|Navaja Knife|0.18|0.18|121.00
★ Navaja Knife | Scorched (Factory New)|Covert|951|Navaja Knife|0.11|0.06|106.00
★ Navaja Knife | Slaughter (Factory New)|Covert|952|Navaja Knife|0.02|0.48|172.00
★ Navaja Knife | Stained (Factory New)|Covert|953|Navaja Knife|0.07|0.15|136.00
★ Navaja Knife | Urban Masked (Factory New)|Covert|954|Navaja Knife|0.33|0.02|173.00
★ Talon Knife | Vanilla (Factory New)|Covert|955|Talon Knife|0.15|0.06|144.00
★ Talon Knife | Blue Steel (Factory New)|Covert|956|Talon Knife|0.43|0.06|117.00
★ Talon Knife | Boreal Forest (Factory New)|Covert|957|Talon Knife|0.19|0.18|108.00
★ Talon Knife | Case Hardened (Factory New)|Covert|958|Talon Knife|0.18|0.08|153.00
★ Talon Knife | Crimson Web (Factory New)|Covert|959|Talon Knife|0.00|0.32|105.00
★ Talon Knife | Fade (Factory New)|Covert|960|Talon Knife|0.97|0.23|154.00
★ Talon Knife | Forest DDPAT (Factory New)|Covert|961|Talon Knife|0.25|0.24|105.00
★ Talon Knife | Night Stripe (Factory New)|Covert|962|Talon Knife|0.56|0.22|79.00
★ Talon Knife | Safari Mesh (Factory New)|Covert|963|Talon Knife|0.20|0.16|101.00
★ Talon Knife | Scorched (Factory New)|Covert|964|Talon Knife|0.10|0.04|115.00
★ Talon Knife | Slaughter (Factory New)|Covert|965|Talon Knife|0.02|0.30|172.00
★ Talon Knife | Stained (Factory New)|Covert|966|Talon Knife|0.25|0.04|145.00
★ Talon Knife | Urban Masked (Factory New)|Covert|967|Talon Knife|0.44|0.04|142.00
PP-Bizon | Facility Sketch (Factory New)|Consumer Grade|968|PP-Bizon|0.11|0.15|149.00
Souvenir PP-Bizon | Facility Sketch (Factory New)|Consumer Grade|968|PP-Bizon|0.11|0.15|149.00
P250 | Facility Draft (Factory New)|Consumer Grade|969|P250|0.03|0.15|79.00
Souvenir P250 | Facility Draft (Factory New)|Consumer Grade|969|P250|0.03|0.15|79.00
UMP-45 | Facility Dark (Factory New)|Consumer Grade|970|UMP-45|0.25|0.03|70.00
Souvenir UMP-45 | Facility Dark (Factory New)|Consumer Grade|970|UMP-45|0.25|0.03|70.00
Five-SeveN | Coolant (Factory New)|Consumer Grade|971|Five-SeveN|0.27|0.21|140.00
Souvenir Five-SeveN | Coolant (Factory New)|Consumer Grade|971|Five-SeveN|0.27|0.21|140.00
Nova | Mandrel (Factory New)|Consumer Grade|972|Nova|0.12|0.16|109.00
Souvenir Nova | Mandrel (Factory New)|Consumer Grade|972|Nova|0.12|0.16|109.00
M4A4 | Mainframe (Factory New)|Industrial Grade|973|M4A4|0.14|0.09|67.00
Souvenir M4A4 | Mainframe (Factory New)|Industrial Grade|973|M4A4|0.14|0.09|67.00
MP7 | Motherboard (Factory New)|Industrial Grade|974|MP7|0.27|0.23|86.00
Souvenir MP7 | Motherboard (Factory New)|Industrial Grade|974|MP7|0.27|0.23|86.00
Negev | Bulkhead (Factory New)|Industrial Grade|975|Negev|0.11|0.55|127.00
Souvenir Negev | Bulkhead (Factory New)|Industrial Grade|975|Negev|0.11|0.55|127.00
Galil AR | Cold Fusion (Factory New)|Industrial Grade|976|Galil AR|0.56|0.21|86.00
Souvenir Galil AR | Cold Fusion (Factory New)|Industrial Grade|976|Galil AR|0.56|0.21|86.00
P90 | Facility Negative (Factory New)|Mil-Spec|977|P90|0.33|0.08|97.00
Souvenir P90 | Facility Negative (Factory New)|Mil-Spec|977|P90|0.33|0.08|97.00
MP5-SD | Co-Processor (Factory New)|Mil-Spec|978|MP5-SD|0.54|0.19|78.00
Souvenir MP5-SD | Co-Processor (Factory New)|Mil-Spec|978|MP5-SD|0.54|0.19|78.00
P250 | Exchanger (Factory New)|Mil-Spec|979|P250|0.14|0.16|104.00
Souvenir P250 | Exchanger (Factory New)|Mil-Spec|979|P250|0.14|0.16|104.00
AWP | Acheron (Factory New)|Mil-Spec|980|AWP|0.05|0.09|80.00
Souvenir AWP | Acheron (Factory New)|Mil-Spec|980|AWP|0.05|0.09|80.00
AUG | Random Access (Factory New)|Restricted|981|AUG|0.06|0.22|83.00
Souvenir AUG | Random Access (Factory New)|Restricted|981|AUG|0.06|0.22|83.00
MAG-7 | Core Breach (Factory New)|Restricted|982|MAG-7|0.04|0.58|104.00
Souvenir MAG-7 | Core Breach (Factory New)|Restricted|982|MAG-7|0.04|0.58|104.00
Glock-18 | Nuclear Garden (Factory New)|Restricted|983|Glock-18|0.21|0.31|83.00
Souvenir Glock-18 | Nuclear Garden (Factory New)|Restricted|983|Glock-18|0.21|0.31|83.00
Tec-9 | Remote Control (Factory New)|Classified|984|Tec-9|0.15|0.10|84.00
Souvenir Tec-9 | Remote Control (Factory New)|Classified|984|Tec-9|0.15|0.10|84.00
M4A1-S | Control Panel (Factory New)|Classified|985|M4A1-S|0.42|0.08|53.00
Souvenir M4A1-S | Control Panel (Factory New)|Classified|985|M4A1-S|0.42|0.08|53.00
UMP-45 | Mudder (Factory New)|Consumer Grade|986|UMP-45|0.11|0.25|96.00
Souvenir UMP-45 | Mudder (Factory New)|Consumer Grade|986|UMP-45|0.11|0.25|96.00
MP5-SD | Dirt Drop (Factory New)|Consumer Grade|987|MP5-SD|0.11|0.11|81.00
Souvenir MP5-SD | Dirt Drop (Factory New)|Consumer Grade|987|MP5-SD|0.11|0.11|81.00
MP9 | Slide (Factory New)|Consumer Grade|988|MP9|0.07|0.38|72.00
Souvenir MP9 | Slide (Factory New)|Consumer Grade|988|MP9|0.07|0.38|72.00
AUG | Sweeper (Factory New)|Consumer Grade|989|AUG|0.08|0.30|90.00
Souvenir AUG | Sweeper (Factory New)|Consumer Grade|989|AUG|0.08|0.30|90.00
MAG-7 | Rust Coat (Factory New)|Consumer Grade|990|MAG-7|0.50|0.03|71.00
Souvenir MAG-7 | Rust Coat (Factory New)|Consumer Grade|990|MAG-7|0.50|0.03|71.00
PP-Bizon | Candy Apple (Factory New)|Industrial Grade|991|PP-Bizon|0.01|0.52|129.00
Souvenir PP-Bizon | Candy Apple (Factory New)|Industrial Grade|991|PP-Bizon|0.01|0.52|129.00
MAC-10 | Calf Skin (Factory New)|Industrial Grade|992|MAC-10|0.09|0.24|88.00
Souvenir MAC-10 | Calf Skin (Factory New)|Industrial Grade|992|MAC-10|0.09|0.24|88.00
R8 Revolver | Nitro (Factory New)|Industrial Grade|993|R8 Revolver|0.06|0.39|134.00
Souvenir R8 Revolver | Nitro (Factory New)|Industrial Grade|993|R8 Revolver|0.06|0.39|134.00
Glock-18 | High Beam (Factory New)|Industrial Grade|994|Glock-18|0.59|0.12|76.00
Souvenir Glock-18 | High Beam (Factory New)|Industrial Grade|994|Glock-18|0.59|0.12|76.00
SSG 08 | Hand Brake (Factory New)|Mil-Spec|995|SSG 08|0.46|0.10|81.00
Souvenir SSG 08 | Hand Brake (Factory New)|Mil-Spec|995|SSG 08|0.46|0.10|81.00
M4A4 | Converter (Factory New)|Mil-Spec|996|M4A4|0.99|0.28|78.00
Souvenir M4A4 | Converter (Factory New)|Mil-Spec|996|M4A4|0.99|0.28|78.00
USP-S | Check Engine (Factory New)|Mil-Spec|997|USP-S|0.01|0.61|114.00
Souvenir USP-S | Check Engine (Factory New)|Mil-Spec|997|USP-S|0.01|0.61|114.00
Sawed-Off | Brake Light (Factory New)|Mil-Spec|998|Sawed-Off|0.04|0.34|83.00
Souvenir Sawed-Off | Brake Light (Factory New)|Mil-Spec|998|Sawed-Off|0.04|0.34|83.00
P250 | Vino Primo (Factory New)|Restricted|999|P250|0.94|0.33|51.00
Souvenir P250 | Vino Primo (Factory New)|Restricted|999|P250|0.94|0.33|51.00
MP7 | Fade (Factory New)|Restricted|1000|MP7|0.04|0.30|91.00
Souvenir MP7 | Fade (Factory New)|Restricted|1000|MP7|0.04|0.30|91.00
AK-47 | Safety Net (Factory New)|Restricted|1001|AK-47|0.07|0.48|122.00
Souvenir AK-47 | Safety Net (Factory New)|Restricted|1001|AK-47|0.07|0.48|122.00
Dual Berettas | Twin Turbo (Factory New)|Classified|1002|Dual Berettas|0.12|0.35|106.00
Souvenir Dual Berettas | Twin Turbo (Factory New)|Classified|1002|Dual Berettas|0.12|0.35|106.00
SG 553 | Integrale (Factory New)|Classified|1003|SG 553|0.96|0.22|112.00
Souvenir SG 553 | Integrale (Factory New)|Classified|1003|SG 553|0.96|0.22|112.00
MP9 | Modest Threat (Factory New)|Mil-Spec|1005|MP9|0.07|0.43|87.00
Glock-18 | Oxide Blaze (Factory New)|Mil-Spec|1006|Glock-18|0.08|0.18|101.00
Nova | Wood Fired (Factory New)|Mil-Spec|1007|Nova|0.17|0.21|68.00
M4A4 | Magnesium (Factory New)|Mil-Spec|1008|M4A4|0.08|0.05|78.00
Sawed-Off | Black Sand (Factory New)|Mil-Spec|1009|Sawed-Off|0.11|0.27|83.00
SG 553 | Danger Close (Factory New)|Mil-Spec|1010|SG 553|0.07|0.25|68.00
G3SG1 | Scavenger (Factory New)|Restricted|1012|G3SG1|0.10|0.37|65.00
Galil AR | Signal (Factory New)|Restricted|1013|Galil AR|0.81|0.19|74.00
MAC-10 | Pipe Down (Factory New)|Restricted|1014|MAC-10|0.07|0.15|112.00
P250 | Nevermore (Factory New)|Restricted|1015|P250|0.01|0.54|94.00
USP-S | Flashback (Factory New)|Restricted|1016|USP-S|0.14|0.23|94.00
UMP-45 | Momentum (Factory New)|Classified|1017|UMP-45|0.03|0.09|122.00
Desert Eagle | Mecha Industries (Factory New)|Classified|1018|Desert Eagle|0.11|0.15|109.00
MP5-SD | Phosphor (Factory New)|Classified|1019|MP5-SD|0.48|0.26|77.00
AK-47 | Asiimov (Factory New)|Covert|1020|AK-47|0.06|0.34|119.00
AWP | Neo-Noir (Factory New)|Covert|1021|AWP|0.59|0.10|90.00
FAMAS | Crypsis (Factory New)|Mil-Spec|1022|FAMAS|0.08|0.40|99.00
AK-47 | Uncharted (Factory New)|Mil-Spec|1023|AK-47|0.09|0.20|56.00
MAC-10 | Whitefish (Factory New)|Mil-Spec|1024|MAC-10|0.17|0.05|88.00
Galil AR | Akoben (Factory New)|Mil-Spec|1025|Galil AR|0.06|0.17|120.00
P250 | Verdigris (Factory New)|Mil-Spec|1027|P250|0.11|0.35|84.00
P90 | Off World (Factory New)|Mil-Spec|1028|P90|0.53|0.33|90.00
AWP | Atheris (Factory New)|Restricted|1029|AWP|0.52|0.37|83.00
Tec-9 | Bamboozle (Factory New)|Restricted|1030|Tec-9|0.21|0.36|92.00
Desert Eagle | Light Rail (Factory New)|Restricted|1031|Desert Eagle|0.10|0.19|37.00
MP5-SD | Gauss (Factory New)|Restricted|1032|MP5-SD|0.09|0.18|99.00
UMP-45 | Moonrise (Factory New)|Restricted|1033|UMP-45|0.83|0.13|69.00
AUG | Momentum (Factory New)|Classified|1035|AUG|0.28|0.03|87.00
Five-SeveN | Angry Mob (Factory New)|Covert|1037|Five-SeveN|0.14|0.31|117.00
M4A4 | The Emperor (Factory New)|Covert|1038|M4A4|0.62|0.26|78.00
★ Navaja Knife | Damascus Steel (Factory New)|Covert|1039|Navaja Knife|0.08|0.15|149.00
★ Navaja Knife | Marble Fade (Factory New)|Covert|1041|Navaja Knife|0.05|0.38|127.00
★ Navaja Knife | Tiger Tooth (Factory New)|Covert|1043|Navaja Knife|0.09|0.64|187.00
★ Navaja Knife | Ultraviolet (Factory New)|Covert|1044|Navaja Knife|0.73|0.26|96.00
★ Stiletto Knife | Damascus Steel (Factory New)|Covert|1045|Stiletto Knife|0.00|0.00|95.00
★ Stiletto Knife | Marble Fade (Factory New)|Covert|1047|Stiletto Knife|0.04|0.23|77.00
★ Stiletto Knife | Tiger Tooth (Factory New)|Covert|1049|Stiletto Knife|0.09|0.60|129.00
★ Stiletto Knife | Ultraviolet (Factory New)|Covert|1050|Stiletto Knife|0.73|0.25|88.00
★ Talon Knife | Damascus Steel (Factory New)|Covert|1051|Talon Knife|0.23|0.05|154.00
★ Talon Knife | Marble Fade (Factory New)|Covert|1053|Talon Knife|0.06|0.11|132.00
★ Talon Knife | Tiger Tooth (Factory New)|Covert|1055|Talon Knife|0.11|0.47|180.00
★ Talon Knife | Ultraviolet (Factory New)|Covert|1056|Talon Knife|0.73|0.28|98.00
★ Ursus Knife | Damascus Steel (Factory New)|Covert|1057|Ursus Knife|0.29|0.06|120.00
★ Ursus Knife | Marble Fade (Factory New)|Covert|1059|Ursus Knife|0.02|0.20|100.00
★ Ursus Knife | Tiger Tooth (Factory New)|Covert|1061|Ursus Knife|0.11|0.58|146.00
★ Ursus Knife | Ultraviolet (Factory New)|Covert|1062|Ursus Knife|0.73|0.33|98.00
P250 | X-Ray (Factory New)|Restricted|1063|P250|0.45|0.38|120.00
Dual Berettas | Elite 1.6 (Factory New)|Mil-Spec|1064|Dual Berettas|0.17|0.05|64.00
Tec-9 | Flash Out (Factory New)|Mil-Spec|1065|Tec-9|0.12|0.18|104.00
MAC-10 | Classic Crate (Factory New)|Mil-Spec|1066|MAC-10|0.15|0.17|77.00
MAG-7 | Popdog (Factory New)|Mil-Spec|1067|MAG-7|0.15|0.15|60.00
SCAR-20 | Assault (Factory New)|Mil-Spec|1068|SCAR-20|0.57|0.11|84.00
FAMAS | Decommissioned (Factory New)|Mil-Spec|1069|FAMAS|0.08|0.15|66.00
Glock-18 | Sacrifice (Factory New)|Mil-Spec|1070|Glock-18|0.06|0.12|88.00
M249 | Aztec (Factory New)|Restricted|1071|M249|0.21|0.17|92.00
MP5-SD | Agent (Factory New)|Restricted|1072|MP5-SD|0.25|0.08|71.00
Five-SeveN | Buddy (Factory New)|Restricted|1073|Five-SeveN|0.11|0.22|101.00
P250 | Inferno (Factory New)|Restricted|1074|P250|0.10|0.42|104.00
UMP-45 | Plastique (Factory New)|Restricted|1075|UMP-45|0.41|0.14|91.00
MP9 | Hydra (Factory New)|Classified|1076|MP9|0.21|0.41|104.00
P90 | Nostalgia (Factory New)|Classified|1077|P90|0.09|0.16|101.00
AUG | Death by Puppy (Factory New)|Classified|1078|AUG|0.58|0.05|79.00
AWP | Wildfire (Factory New)|Covert|1079|AWP|0.05|0.49|92.00
FAMAS | Commemoration (Factory New)|Covert|1080|FAMAS|0.10|0.54|89.00
★ Classic Knife | Vanilla (Factory New)|Covert|1081|Classic Knife|0.50|0.03|98.00
★ Classic Knife | Fade (Factory New)|Covert|1082|Classic Knife|0.01|0.33|122.00
★ Classic Knife | Slaughter (Factory New)|Covert|1083|Classic Knife|1.00|0.43|147.00
★ Classic Knife | Blue Steel (Factory New)|Covert|1084|Classic Knife|0.58|0.17|76.00
★ Classic Knife | Stained (Factory New)|Covert|1085|Classic Knife|0.57|0.09|113.00
★ Classic Knife | Case Hardened (Factory New)|Covert|1086|Classic Knife|0.21|0.06|134.00
★ Classic Knife | Forest DDPAT (Factory New)|Covert|1087|Classic Knife|0.19|0.21|128.00
★ Classic Knife | Boreal Forest (Factory New)|Covert|1088|Classic Knife|0.21|0.20|128.00
★ Classic Knife | Crimson Web (Factory New)|Covert|1089|Classic Knife|0.01|0.44|132.00
★ Classic Knife | Scorched (Factory New)|Covert|1090|Classic Knife|0.08|0.04|103.00
★ Classic Knife | Safari Mesh (Factory New)|Covert|1091|Classic Knife|0.17|0.17|127.00
★ Classic Knife | Night Stripe (Factory New)|Covert|1092|Classic Knife|0.56|0.20|93.00
★ Classic Knife | Urban Masked (Factory New)|Covert|1093|Classic Knife|0.30|0.03|187.00
MP5-SD | Bamboo Garden (Factory New)|Consumer Grade|1094|MP5-SD|0.17|0.21|110.00
MAC-10 | Surfwood (Factory New)|Consumer Grade|1095|MAC-10|0.24|0.17|172.00
PP-Bizon | Seabird (Factory New)|Consumer Grade|1096|PP-Bizon|0.44|0.18|146.00
Sawed-Off | Jungle Thicket (Factory New)|Consumer Grade|1097|Sawed-Off|0.24|0.43|67.00
M249 | Jungle (Factory New)|Consumer Grade|1098|M249|0.26|0.23|111.00
P90 | Sunset Lily (Factory New)|Industrial Grade|1099|P90|0.04|0.29|72.00
M4A4 | Dark Blossom (Factory New)|Industrial Grade|1100|M4A4|0.55|0.17|66.00
XM1014 | Banana Leaf (Factory New)|Industrial Grade|1101|XM1014|0.20|0.38|65.00
Tec-9 | Rust Leaf (Factory New)|Industrial Grade|1102|Tec-9|0.09|0.43|95.00
UMP-45 | Day Lily (Factory New)|Mil-Spec|1103|UMP-45|0.15|0.14|80.00
Five-SeveN | Crimson Blossom (Factory New)|Mil-Spec|1104|Five-SeveN|0.96|0.49|86.00
MP7 | Teal Blossom (Factory New)|Mil-Spec|1105|MP7|0.37|0.21|66.00
FAMAS | Sundown (Factory New)|Mil-Spec|1106|FAMAS|0.68|0.18|77.00
SSG 08 | Sea Calico (Factory New)|Restricted|1107|SSG 08|0.21|0.23|69.00
Glock-18 | Synth Leaf (Factory New)|Restricted|1108|Glock-18|0.56|0.40|68.00
AUG | Midnight Lily (Factory New)|Restricted|1109|AUG|0.17|0.05|83.00
MP9 | Wild Lily (Factory New)|Classified|1110|MP9|0.75|0.18|92.00
AK-47 | Wild Lotus (Factory New)|Covert|1111|AK-47|0.17|0.31|80.00
AUG | Navy Murano (Factory New)|Consumer Grade|1112|AUG|0.64|0.28|68.00
SCAR-20 | Stone Mosaico (Factory New)|Consumer Grade|1113|SCAR-20|0.15|0.11|73.00
R8 Revolver | Canal Spray (Factory New)|Consumer Grade|1114|R8 Revolver|0.50|0.32|76.00
Negev | Boroque Sand (Factory New)|Consumer Grade|1115|Negev|0.17|0.16|103.00
CZ75-Auto | Indigo (Factory New)|Consumer Grade|1116|CZ75-Auto|0.56|0.11|100.00
AK-47 | Baroque Purple (Factory New)|Industrial Grade|1117|AK-47|0.06|0.05|66.00
SG 553 | Candy Apple (Factory New)|Industrial Grade|1118|SG 553|0.01|0.50|114.00
P250 | Dark Filigree (Factory New)|Industrial Grade|1119|P250|0.00|0.02|46.00
Tec-9 | Orange Murano (Factory New)|Industrial Grade|1120|Tec-9|0.08|0.38|104.00
P90 | Baroque Red (Factory New)|Mil-Spec|1121|P90|0.06|0.18|73.00
G3SG1 | Violet Murano (Factory New)|Mil-Spec|1122|G3SG1|0.67|0.10|63.00
Dual Berettas | Emerald (Factory New)|Mil-Spec|1123|Dual Berettas|0.40|0.52|77.00
SSG 08 | Orange Filigree (Factory New)|Mil-Spec|1124|SSG 08|0.07|0.35|69.00
MP9 | Stained Glass (Factory New)|Restricted|1125|MP9|0.59|0.38|76.00
MAC-10 | Red Filigree (Factory New)|Restricted|1126|MAC-10|0.08|0.14|90.00
Nova | Baroque Orange (Factory New)|Restricted|1127|Nova|0.09|0.18|83.00
MAG-7 | Cinquedea (Factory New)|Classified|1128|MAG-7|0.04|0.31|83.00
AWP | The Prince (Factory New)|Covert|1129|AWP|0.11|0.24|66.00
SG 553 | Barricade (Factory New)|Consumer Grade|1130|SG 553|0.37|0.08|66.00
Galil AR | Tornado (Factory New)|Consumer Grade|1131|Galil AR|0.56|0.02|127.00
MP7 | Scorched (Factory New)|Consumer Grade|1132|MP7|0.08|0.13|63.00
SSG 08 | Red Stone (Factory New)|Consumer Grade|1133|SSG 08|0.05|0.26|85.00
FAMAS | Night Borre (Factory New)|Consumer Grade|1134|FAMAS|0.62|0.09|79.00
M4A1-S | Moss Quartz (Factory New)|Industrial Grade|1135|M4A1-S|0.25|0.25|79.00
USP-S | Pathfinder (Factory New)|Industrial Grade|1136|USP-S|0.12|0.09|87.00
MAG-7 | Chainmail (Factory New)|Industrial Grade|1137|MAG-7|0.14|0.17|80.00
Dual Berettas | Pyre (Factory New)|Industrial Grade|1138|Dual Berettas|0.05|0.38|74.00
SCAR-20 | Brass (Factory New)|Mil-Spec|1139|SCAR-20|0.17|0.24|58.00
CZ75-Auto | Emerald Quartz (Factory New)|Mil-Spec|1140|CZ75-Auto|0.24|0.29|95.00
XM1014 | Frost Borre (Factory New)|Mil-Spec|1141|XM1014|0.50|0.03|74.00
MAC-10 | Copper Borre (Factory New)|Mil-Spec|1142|MAC-10|0.11|0.26|102.00
AUG | Flame Jörmungandr (Factory New)|Restricted|1143|AUG|0.08|0.34|90.00
Desert Eagle | Emerald Jörmungandr (Factory New)|Restricted|1144|Desert Eagle|0.34|0.36|66.00
P90 | Astral Jörmungandr (Factory New)|Restricted|1145|P90|0.47|0.34|82.00
Negev | Mjölnir (Factory New)|Classified|1146|Negev|0.04|0.63|115.00
AWP | Gungnir (Factory New)|Covert|1147|AWP|0.33|0.04|98.00
MP5-SD | Acid Wash (Factory New)|Mil-Spec|1148|MP5-SD|0.33|0.02|46.00
Nova | Plume (Factory New)|Mil-Spec|1149|Nova|0.07|0.31|117.00
G3SG1 | Black Sand (Factory New)|Mil-Spec|1150|G3SG1|0.11|0.29|89.00
R8 Revolver | Memento (Factory New)|Mil-Spec|1151|R8 Revolver|0.12|0.22|104.00
Dual Berettas | Balance (Factory New)|Mil-Spec|1152|Dual Berettas|0.12|0.15|88.00
SCAR-20 | Torn (Factory New)|Mil-Spec|1153|SCAR-20|0.13|0.18|101.00
M249 | Warbird (Factory New)|Mil-Spec|1154|M249|0.11|0.17|90.00
PP-Bizon | Embargo (Factory New)|Restricted|1155|PP-Bizon|0.24|0.15|94.00
AK-47 | Rat Rod (Factory New)|Restricted|1156|AK-47|0.14|0.09|66.00
AUG | Arctic Wolf (Factory New)|Restricted|1157|AUG|0.09|0.09|97.00
MP7 | Neon Ply (Factory New)|Restricted|1158|MP7|0.30|0.17|81.00
P2000 | Obsidian (Factory New)|Restricted|1159|P2000|0.01|0.50|119.00
Tec-9 | Decimator (Factory New)|Classified|1160|Tec-9|0.75|0.24|91.00
SG 553 | Colony IV (Factory New)|Classified|1161|SG 553|0.10|0.48|91.00
AWP | Containment Breach (Factory New)|Covert|1163|AWP|0.23|0.40|91.00
MAC-10 | Stalker (Factory New)|Covert|1164|MAC-10|0.15|0.43|92.00
★ Nomad Knife | Vanilla (Factory New)|Covert|1165|Nomad Knife|0.58|0.03|59.00
★ Nomad Knife | Fade (Factory New)|Covert|1166|Nomad Knife|0.01|0.24|142.00
★ Nomad Knife | Slaughter (Factory New)|Covert|1167|Nomad Knife|0.99|0.31|157.00
★ Nomad Knife | Blue Steel (Factory New)|Covert|1168|Nomad Knife|0.58|0.16|104.00
★ Nomad Knife | Stained (Factory New)|Covert|1169|Nomad Knife|0.57|0.09|139.00
★ Nomad Knife | Case Hardened (Factory New)|Covert|1170|Nomad Knife|0.54|0.03|142.00
★ Nomad Knife | Forest DDPAT (Factory New)|Covert|1171|Nomad Knife|0.21|0.19|140.00
★ Nomad Knife | Boreal Forest (Factory New)|Covert|1172|Nomad Knife|0.24|0.16|140.00
★ Nomad Knife | Crimson Web (Factory New)|Covert|1173|Nomad Knife|0.00|0.35|135.00
★ Nomad Knife | Scorched (Factory New)|Covert|1174|Nomad Knife|0.10|0.04|123.00
★ Nomad Knife | Safari Mesh (Factory New)|Covert|1175|Nomad Knife|0.20|0.17|144.00
★ Nomad Knife | Night Stripe (Factory New)|Covert|1176|Nomad Knife|0.57|0.23|105.00
★ Nomad Knife | Urban Masked (Factory New)|Covert|1177|Nomad Knife|0.48|0.04|198.00
★ Skeleton Knife | Vanilla (Factory New)|Covert|1178|Skeleton Knife|0.50|0.02|47.00
★ Skeleton Knife | Fade (Factory New)|Covert|1179|Skeleton Knife|0.03|0.29|135.00
★ Skeleton Knife | Slaughter (Factory New)|Covert|1180|Skeleton Knife|0.99|0.42|149.00
★ Skeleton Knife | Blue Steel (Factory New)|Covert|1181|Skeleton Knife|0.58|0.25|87.00
★ Skeleton Knife | Stained (Factory New)|Covert|1182|Skeleton Knife|0.56|0.11|122.00
★ Skeleton Knife | Case Hardened (Factory New)|Covert|1183|Skeleton Knife|0.25|0.03|127.00
★ Skeleton Knife | Forest DDPAT (Factory New)|Covert|1184|Skeleton Knife|0.21|0.23|118.00
★ Skeleton Knife | Boreal Forest (Factory New)|Covert|1185|Skeleton Knife|0.18|0.16|111.00
★ Skeleton Knife | Scorched (Factory New)|Covert|1187|Skeleton Knife|0.10|0.04|125.00
★ Skeleton Knife | Safari Mesh (Factory New)|Covert|1188|Skeleton Knife|0.19|0.17|116.00
★ Skeleton Knife | Night Stripe (Factory New)|Covert|1189|Skeleton Knife|0.56|0.21|85.00
★ Skeleton Knife | Urban Masked (Factory New)|Covert|1190|Skeleton Knife|0.37|0.03|166.00
★ Survival Knife | Vanilla (Factory New)|Covert|1191|Survival Knife|0.53|0.09|123.00
★ Survival Knife | Fade (Factory New)|Covert|1192|Survival Knife|0.99|0.29|114.00
★ Survival Knife | Slaughter (Factory New)|Covert|1193|Survival Knife|0.99|0.38|128.00
★ Survival Knife | Blue Steel (Factory New)|Covert|1194|Survival Knife|0.58|0.22|77.00
★ Survival Knife | Stained (Factory New)|Covert|1195|Survival Knife|0.58|0.09|108.00
★ Survival Knife | Case Hardened (Factory New)|Covert|1196|Survival Knife|0.20|0.04|113.00
★ Survival Knife | Forest DDPAT (Factory New)|Covert|1197|Survival Knife|0.21|0.24|127.00
★ Survival Knife | Boreal Forest (Factory New)|Covert|1198|Survival Knife|0.17|0.16|122.00
★ Survival Knife | Crimson Web (Factory New)|Covert|1199|Survival Knife|0.01|0.41|125.00
★ Survival Knife | Scorched (Factory New)|Covert|1200|Survival Knife|0.12|0.06|111.00
★ Survival Knife | Safari Mesh (Factory New)|Covert|1201|Survival Knife|0.17|0.17|126.00
★ Survival Knife | Night Stripe (Factory New)|Covert|1202|Survival Knife|0.57|0.22|91.00
★ Survival Knife | Urban Masked (Factory New)|Covert|1203|Survival Knife|0.30|0.03|182.00
★ Paracord Knife | Vanilla (Factory New)|Covert|1204|Paracord Knife|0.56|0.10|63.00
★ Paracord Knife | Fade (Factory New)|Covert|1205|Paracord Knife|0.02|0.32|111.00
★ Paracord Knife | Slaughter (Factory New)|Covert|1206|Paracord Knife|0.00|0.42|134.00
★ Paracord Knife | Blue Steel (Factory New)|Covert|1207|Paracord Knife|0.57|0.14|69.00
★ Paracord Knife | Stained (Factory New)|Covert|1208|Paracord Knife|0.55|0.07|101.00
★ Paracord Knife | Case Hardened (Factory New)|Covert|1209|Paracord Knife|0.19|0.05|120.00
★ Paracord Knife | Forest DDPAT (Factory New)|Covert|1210|Paracord Knife|0.13|0.22|116.00
★ Paracord Knife | Boreal Forest (Factory New)|Covert|1211|Paracord Knife|0.29|0.23|122.00
★ Paracord Knife | Crimson Web (Factory New)|Covert|1212|Paracord Knife|0.01|0.44|122.00
★ Paracord Knife | Scorched (Factory New)|Covert|1213|Paracord Knife|0.10|0.05|94.00
★ Paracord Knife | Safari Mesh (Factory New)|Covert|1214|Paracord Knife|0.17|0.19|122.00
★ Paracord Knife | Night Stripe (Factory New)|Covert|1215|Paracord Knife|0.56|0.22|86.00
★ Paracord Knife | Urban Masked (Factory New)|Covert|1216|Paracord Knife|0.33|0.03|181.00
AUG | Tom Cat (Factory New)|Mil-Spec|1217|AUG|0.19|0.08|83.00
AWP | Capillary (Factory New)|Mil-Spec|1218|AWP|0.19|0.06|95.00
CZ75-Auto | Distressed (Factory New)|Mil-Spec|1219|CZ75-Auto|0.06|0.27|104.00
Desert Eagle | Blue Ply (Factory New)|Mil-Spec|1220|Desert Eagle|0.58|0.26|96.00
MP5-SD | Desert Strike (Factory New)|Mil-Spec|1221|MP5-SD|0.12|0.17|89.00
Negev | Prototype (Factory New)|Mil-Spec|1222|Negev|0.17|0.07|82.00
R8 Revolver | Bone Forged (Factory New)|Mil-Spec|1223|R8 Revolver|0.12|0.10|69.00
P2000 | Acid Etched (Factory New)|Restricted|1224|P2000|0.36|0.18|60.00
Sawed-Off | Apocalypto (Factory New)|Restricted|1225|Sawed-Off|0.71|0.21|101.00
SCAR-20 | Enforcer (Factory New)|Restricted|1226|SCAR-20|0.00|0.07|54.00
SG 553 | Darkwing (Factory New)|Restricted|1227|SG 553|0.01|0.33|72.00
SSG 08 | Fever Dream (Factory New)|Restricted|1228|SSG 08|0.00|0.06|71.00
AK-47 | Phantom Disruptor (Factory New)|Classified|1229|AK-47|0.12|0.27|81.00
MAC-10 | Disco Tech (Factory New)|Classified|1230|MAC-10|0.06|0.21|123.00
MAG-7 | Justice (Factory New)|Classified|1231|MAG-7|0.42|0.05|43.00
M4A1-S | Player Two (Factory New)|Covert|1232|M4A1-S|0.19|0.05|117.00
Glock-18 | Bullet Queen (Factory New)|Covert|1233|Glock-18|0.08|0.51|125.00
Negev | Ultralight (Factory New)|Mil-Spec|1234|Negev|0.15|0.10|79.00
P2000 | Gnarled (Factory New)|Mil-Spec|1235|P2000|0.56|0.05|63.00
SG 553 | Ol' Rusty (Factory New)|Mil-Spec|1236|SG 553|0.05|0.22|83.00
SSG 08 | Mainframe 001 (Factory New)|Mil-Spec|1237|SSG 08|0.60|0.17|69.00
P250 | Cassette (Factory New)|Mil-Spec|1238|P250|0.07|0.19|86.00
P90 | Freight (Factory New)|Mil-Spec|1239|P90|0.07|0.26|78.00
PP-Bizon | Runic (Factory New)|Mil-Spec|1240|PP-Bizon|0.06|0.17|52.00
MAG-7 | Monster Call (Factory New)|Restricted|1241|MAG-7|0.59|0.21|92.00
Tec-9 | Brother (Factory New)|Restricted|1242|Tec-9|0.10|0.29|79.00
MAC-10 | Allure (Factory New)|Restricted|1243|MAC-10|0.12|0.20|107.00
Galil AR | Connexion (Factory New)|Restricted|1244|Galil AR|0.06|0.29|69.00
MP5-SD | Kitbash (Factory New)|Restricted|1245|MP5-SD|0.11|0.16|103.00
M4A4 | Tooth Fairy (Factory New)|Classified|1246|M4A4|0.06|0.20|119.00
Glock-18 | Vogue (Factory New)|Classified|1247|Glock-18|0.95|0.48|124.00
XM1014 | Entombed (Factory New)|Classified|1248|XM1014|0.10|0.22|103.00
Desert Eagle | Printstream (Factory New)|Covert|1249|Desert Eagle|0.11|0.08|143.00
AK-47 | Legion of Anubis (Factory New)|Covert|1250|AK-47|0.10|0.21|48.00
CZ75-Auto | Vendetta (Factory New)|Mil-Spec|1251|CZ75-Auto|0.11|0.22|69.00
P90 | Cocoa Rampage (Factory New)|Mil-Spec|1252|P90|0.12|0.27|85.00
G3SG1 | Digital Mesh (Factory New)|Mil-Spec|1253|G3SG1|0.12|0.12|69.00
Galil AR | Vandal (Factory New)|Mil-Spec|1254|Galil AR|0.14|0.16|76.00
P250 | Contaminant (Factory New)|Mil-Spec|1255|P250|0.01|0.31|83.00
M249 | Deep Relief (Factory New)|Mil-Spec|1256|M249|0.18|0.17|89.00
MP5-SD | Condition Zero (Factory New)|Mil-Spec|1257|MP5-SD|0.50|0.07|75.00
AWP | Exoskeleton (Factory New)|Restricted|1258|AWP|0.50|0.05|55.00
Dual Berettas | Dezastre (Factory New)|Restricted|1259|Dual Berettas|0.52|0.09|75.00
Nova | Clear Polymer (Factory New)|Restricted|1260|Nova|0.42|0.08|102.00
SSG 08 | Parallax (Factory New)|Restricted|1261|SSG 08|0.11|0.04|69.00
UMP-45 | Gold Bismuth (Factory New)|Restricted|1262|UMP-45|0.13|0.11|80.00
Five-SeveN | Fairy Tale (Factory New)|Classified|1263|Five-SeveN|0.94|0.24|153.00
M4A4 | Cyber Security (Factory New)|Classified|1264|M4A4|0.08|0.28|113.00
USP-S | Monster Mashup (Factory New)|Classified|1265|USP-S|0.38|0.35|106.00
M4A1-S | Printstream (Factory New)|Covert|1266|M4A1-S|0.12|0.08|155.00
Glock-18 | Neo-Noir (Factory New)|Covert|1267|Glock-18|0.91|0.10|88.00
XM1014 | Charter (Factory New)|Consumer Grade|1268|XM1014|0.12|0.16|86.00
AUG | Surveillance (Factory New)|Consumer Grade|1269|AUG|0.25|0.08|75.00
MP9 | Army Sheen (Factory New)|Consumer Grade|1270|MP9|0.19|0.14|66.00
P250 | Forest Night (Factory New)|Consumer Grade|1271|P250|0.55|0.20|112.00
CZ75-Auto | Jungle Dashed (Factory New)|Consumer Grade|1272|CZ75-Auto|0.20|0.25|84.00
Desert Eagle | The Bronze (Factory New)|Industrial Grade|1273|Desert Eagle|0.09|0.16|57.00
Dual Berettas | Switch Board (Factory New)|Industrial Grade|1274|Dual Berettas|0.16|0.39|102.00
MP5-SD | Nitro (Factory New)|Industrial Grade|1275|MP5-SD|0.07|0.27|109.00
MAG-7 | Carbon Fiber (Factory New)|Industrial Grade|1276|MAG-7|0.25|0.03|60.00
M4A4 | Global Offensive (Factory New)|Mil-Spec|1277|M4A4|0.25|0.06|93.00
SSG 08 | Threat Detected (Factory New)|Mil-Spec|1278|SSG 08|0.07|0.42|127.00
P2000 | Dispatch (Factory New)|Mil-Spec|1279|P2000|0.47|0.04|122.00
SCAR-20 | Magna Carta (Factory New)|Mil-Spec|1280|SCAR-20|0.94|0.13|62.00
FAMAS | Prime Conspiracy (Factory New)|Restricted|1281|FAMAS|0.59|0.27|63.00
Five-SeveN | Berries And Cherries (Factory New)|Restricted|1282|Five-SeveN|0.00|0.22|67.00
UMP-45 | Crime Scene (Factory New)|Restricted|1283|UMP-45|0.95|0.23|112.00
USP-S | Target Acquired (Factory New)|Classified|1284|USP-S|0.94|0.36|111.00
M4A1-S | Blue Phosphor (Factory New)|Classified|1285|M4A1-S|0.59|0.72|67.00
AWP | Fade (Factory New)|Covert|1286|AWP|0.01|0.24|78.00
Dual Berettas | Heist (Factory New)|Consumer Grade|1287|Dual Berettas|0.13|0.16|114.00
Tec-9 | Phoenix Chalk (Factory New)|Consumer Grade|1288|Tec-9|0.04|0.11|73.00
Sawed-Off | Clay Ambush (Factory New)|Consumer Grade|1289|Sawed-Off|0.06|0.38|76.00
M249 | Predator (Factory New)|Consumer Grade|1291|M249|0.10|0.38|87.00
MP7 | Vault Heist (Factory New)|Industrial Grade|1292|MP7|0.10|0.11|71.00
UMP-45 | Houndstooth (Factory New)|Industrial Grade|1293|UMP-45|0.11|0.22|79.00
R8 Revolver | Phoenix Marker (Factory New)|Industrial Grade|1294|R8 Revolver|0.61|0.38|142.00
Nova | Rust Coat (Factory New)|Industrial Grade|1295|Nova|0.50|0.02|62.00
Desert Eagle | Night Heist (Factory New)|Mil-Spec|1296|Desert Eagle|0.64|0.32|44.00
Negev | Phoenix Stencil (Factory New)|Mil-Spec|1297|Negev|0.06|0.26|77.00
P90 | Tiger Pit (Factory New)|Mil-Spec|1298|P90|0.09|0.25|134.00
P250 | Bengal Tiger (Factory New)|Mil-Spec|1299|P250|0.08|0.27|184.00
Galil AR | Phoenix Blacklight (Factory New)|Restricted|1300|Galil AR|0.74|0.39|155.00
SG 553 | Hypnotic (Factory New)|Restricted|1301|SG 553|0.13|0.07|67.00
Glock-18 | Franklin (Factory New)|Restricted|1302|Glock-18|0.16|0.13|139.00
AWP | Silk Tiger (Factory New)|Classified|1303|AWP|0.42|0.12|108.00
MAC-10 | Hot Snakes (Factory New)|Classified|1304|MAC-10|0.08|0.24|79.00
AK-47 | X-Ray (Factory New)|Covert|1305|AK-47|0.05|0.60|159.00
P90 | Ancient Earth (Factory New)|Consumer Grade|1306|P90|0.10|0.31|67.00
Souvenir P90 | Ancient Earth (Factory New)|Consumer Grade|1306|P90|0.10|0.31|67.00
SG 553 | Lush Ruins (Factory New)|Consumer Grade|1307|SG 553|0.18|0.21|78.00
Souvenir SG 553 | Lush Ruins (Factory New)|Consumer Grade|1307|SG 553|0.18|0.21|78.00
Nova | Army Sheen (Factory New)|Consumer Grade|1308|Nova|0.19|0.13|62.00
Souvenir Nova | Army Sheen (Factory New)|Consumer Grade|1308|Nova|0.19|0.13|62.00
SSG 08 | Jungle Dashed (Factory New)|Consumer Grade|1309|SSG 08|0.21|0.19|70.00
Souvenir SSG 08 | Jungle Dashed (Factory New)|Consumer Grade|1309|SSG 08|0.21|0.19|70.00
R8 Revolver | Night (Factory New)|Consumer Grade|1310|R8 Revolver|0.46|0.06|62.00
Souvenir R8 Revolver | Night (Factory New)|Consumer Grade|1310|R8 Revolver|0.46|0.06|62.00
P2000 | Panther Camo (Factory New)|Industrial Grade|1311|P2000|0.17|0.04|51.00
Souvenir P2000 | Panther Camo (Factory New)|Industrial Grade|1311|P2000|0.17|0.04|51.00
MP7 | Tall Grass (Factory New)|Industrial Grade|1312|MP7|0.22|0.54|108.00
Souvenir MP7 | Tall Grass (Factory New)|Industrial Grade|1312|MP7|0.22|0.54|108.00
G3SG1 | Ancient Ritual (Factory New)|Industrial Grade|1313|G3SG1|0.06|0.24|88.00
Souvenir G3SG1 | Ancient Ritual (Factory New)|Industrial Grade|1313|G3SG1|0.06|0.24|88.00
CZ75-Auto | Silver (Factory New)|Industrial Grade|1314|CZ75-Auto|0.15|0.08|97.00
Souvenir CZ75-Auto | Silver (Factory New)|Industrial Grade|1314|CZ75-Auto|0.15|0.08|97.00
Tec-9 | Blast From the Past (Factory New)|Mil-Spec|1315|Tec-9|0.11|0.34|110.00
Souvenir Tec-9 | Blast From the Past (Factory New)|Mil-Spec|1315|Tec-9|0.11|0.34|110.00
AUG | Carved Jade (Factory New)|Mil-Spec|1316|AUG|0.28|0.30|84.00
Souvenir AUG | Carved Jade (Factory New)|Mil-Spec|1316|AUG|0.28|0.30|84.00
Galil AR | Dusk Ruins (Factory New)|Mil-Spec|1317|Galil AR|0.07|0.50|123.00
Souvenir Galil AR | Dusk Ruins (Factory New)|Mil-Spec|1317|Galil AR|0.07|0.50|123.00
XM1014 | Ancient Lore (Factory New)|Restricted|1319|XM1014|0.12|0.20|105.00
Souvenir XM1014 | Ancient Lore (Factory New)|Restricted|1319|XM1014|0.12|0.20|105.00
MAC-10 | Gold Brick (Factory New)|Restricted|1320|MAC-10|0.12|0.27|89.00
Souvenir MAC-10 | Gold Brick (Factory New)|Restricted|1320|MAC-10|0.12|0.27|89.00
USP-S | Ancient Visions (Factory New)|Restricted|1321|USP-S|0.12|0.24|93.00
Souvenir USP-S | Ancient Visions (Factory New)|Restricted|1321|USP-S|0.12|0.24|93.00
P90 | Run and Hide (Factory New)|Classified|1322|P90|0.10|0.44|91.00
Souvenir P90 | Run and Hide (Factory New)|Classified|1322|P90|0.10|0.44|91.00
AK-47 | Panthera onca (Factory New)|Classified|1323|AK-47|0.10|0.46|117.00
Souvenir AK-47 | Panthera onca (Factory New)|Classified|1323|AK-47|0.10|0.46|117.00
M4A1-S | Welcome to the Jungle (Factory New)|Covert|1324|M4A1-S|0.00|0.31|102.00
Souvenir M4A1-S | Welcome to the Jungle (Factory New)|Covert|1324|M4A1-S|0.00|0.31|102.00
Glock-18 | Clear Polymer (Factory New)|Mil-Spec|1325|Glock-18|0.11|0.11|114.00
M249 | O.S.I.P.R. (Factory New)|Mil-Spec|1326|M249|0.56|0.15|41.00
SG 553 | Heavy Metal (Factory New)|Mil-Spec|1327|SG 553|0.12|0.07|57.00
R8 Revolver | Junk Yard (Factory New)|Mil-Spec|1328|R8 Revolver|0.06|0.35|83.00
UMP-45 | Oscillator (Factory New)|Mil-Spec|1329|UMP-45|0.08|0.32|44.00
Nova | Windblown (Factory New)|Mil-Spec|1330|Nova|0.56|0.24|110.00
CZ75-Auto | Circaetus (Factory New)|Mil-Spec|1331|CZ75-Auto|0.05|0.18|76.00
AK-47 | Slate (Factory New)|Restricted|1332|AK-47|0.33|0.03|39.00
P250 | Cyber Shell (Factory New)|Restricted|1333|P250|0.10|0.12|57.00
Negev | dev_texture (Factory New)|Restricted|1334|Negev|0.08|0.38|96.00
MAC-10 | Button Masher (Factory New)|Restricted|1335|MAC-10|0.10|0.11|108.00
Desert Eagle | Trigger Discipline (Factory New)|Restricted|1336|Desert Eagle|0.92|0.18|103.00
MP9 | Food Chain (Factory New)|Classified|1337|MP9|0.06|0.37|111.00
XM1014 | XOXO (Factory New)|Classified|1338|XM1014|0.08|0.26|98.00
Galil AR | Chromatic Aberration (Factory New)|Classified|1339|Galil AR|0.91|0.11|84.00
USP-S | The Traitor (Factory New)|Covert|1340|USP-S|0.01|0.39|64.00
M4A4 | In Living Color (Factory New)|Covert|1341|M4A4|0.14|0.17|119.00
R8 Revolver | Desert Brush (Factory New)|Consumer Grade|1342|R8 Revolver|0.11|0.27|169.00
Souvenir R8 Revolver | Desert Brush (Factory New)|Consumer Grade|1342|R8 Revolver|0.11|0.27|169.00
P90 | Desert DDPAT (Factory New)|Consumer Grade|1343|P90|0.09|0.33|131.00
Souvenir P90 | Desert DDPAT (Factory New)|Consumer Grade|1343|P90|0.09|0.33|131.00
SG 553 | Bleached (Factory New)|Consumer Grade|1344|SG 553|0.09|0.31|108.00
Souvenir SG 553 | Bleached (Factory New)|Consumer Grade|1344|SG 553|0.09|0.31|108.00
MP7 | Prey (Factory New)|Consumer Grade|1345|MP7|0.06|0.18|87.00
Souvenir MP7 | Prey (Factory New)|Consumer Grade|1345|MP7|0.06|0.18|87.00
Sawed-Off | Parched (Factory New)|Consumer Grade|1346|Sawed-Off|0.96|0.06|71.00
Souvenir Sawed-Off | Parched (Factory New)|Consumer Grade|1346|Sawed-Off|0.96|0.06|71.00
AUG | Spalted Wood (Factory New)|Industrial Grade|1347|AUG|0.09|0.25|89.00
Souvenir AUG | Spalted Wood (Factory New)|Industrial Grade|1347|AUG|0.09|0.25|89.00
MP9 | Old Roots (Factory New)|Industrial Grade|1348|MP9|0.16|0.33|87.00
Souvenir MP9 | Old Roots (Factory New)|Industrial Grade|1348|MP9|0.16|0.33|87.00
Five-SeveN | Withered Vine (Factory New)|Industrial Grade|1349|Five-SeveN|0.07|0.21|101.00
Souvenir Five-SeveN | Withered Vine (Factory New)|Industrial Grade|1349|Five-SeveN|0.07|0.21|101.00
M249 | Midnight Palm (Factory New)|Industrial Grade|1350|M249|0.25|0.03|74.00
Souvenir M249 | Midnight Palm (Factory New)|Industrial Grade|1350|M249|0.25|0.03|74.00
P250 | Black & Tan (Factory New)|Mil-Spec|1351|P250|0.10|0.24|117.00
Souvenir P250 | Black & Tan (Factory New)|Mil-Spec|1351|P250|0.10|0.24|117.00
Nova | Quick Sand (Factory New)|Mil-Spec|1352|Nova|0.13|0.18|114.00
Souvenir Nova | Quick Sand (Factory New)|Mil-Spec|1352|Nova|0.13|0.18|114.00
G3SG1 | New Roots (Factory New)|Mil-Spec|1353|G3SG1|0.15|0.27|95.00
Souvenir G3SG1 | New Roots (Factory New)|Mil-Spec|1353|G3SG1|0.15|0.27|95.00
Galil AR | Amber Fade (Factory New)|Mil-Spec|1354|Galil AR|0.15|0.12|72.00
Souvenir Galil AR | Amber Fade (Factory New)|Mil-Spec|1354|Galil AR|0.15|0.12|72.00
USP-S | Orange Anolis (Factory New)|Restricted|1355|USP-S|0.08|0.32|132.00
Souvenir USP-S | Orange Anolis (Factory New)|Restricted|1355|USP-S|0.08|0.32|132.00
M4A4 | Red DDPAT (Factory New)|Restricted|1356|M4A4|0.00|0.41|99.00
Souvenir M4A4 | Red DDPAT (Factory New)|Restricted|1356|M4A4|0.00|0.41|99.00
MAC-10 | Case Hardened (Factory New)|Restricted|1357|MAC-10|0.19|0.07|91.00
Souvenir MAC-10 | Case Hardened (Factory New)|Restricted|1357|MAC-10|0.19|0.07|91.00
UMP-45 | Fade (Factory New)|Classified|1358|UMP-45|0.04|0.31|90.00
Souvenir UMP-45 | Fade (Factory New)|Classified|1358|UMP-45|0.04|0.31|90.00
SSG 08 | Death Strike (Factory New)|Classified|1359|SSG 08|0.10|0.38|101.00
Souvenir SSG 08 | Death Strike (Factory New)|Classified|1359|SSG 08|0.10|0.38|101.00
AK-47 | Gold Arabesque (Factory New)|Covert|1360|AK-47|0.10|0.47|85.00
Souvenir AK-47 | Gold Arabesque (Factory New)|Covert|1360|AK-47|0.10|0.47|85.00
P250 | Drought (Factory New)|Consumer Grade|1361|P250|0.96|0.08|106.00
Souvenir P250 | Drought (Factory New)|Consumer Grade|1361|P250|0.96|0.08|106.00
PP-Bizon | Anolis (Factory New)|Consumer Grade|1362|PP-Bizon|0.19|0.24|67.00
Souvenir PP-Bizon | Anolis (Factory New)|Consumer Grade|1362|PP-Bizon|0.19|0.24|67.00
MAG-7 | Navy Sheen (Factory New)|Consumer Grade|1363|MAG-7|0.61|0.22|77.00
Souvenir MAG-7 | Navy Sheen (Factory New)|Consumer Grade|1363|MAG-7|0.61|0.22|77.00
MAC-10 | Sienna Damask (Factory New)|Consumer Grade|1364|MAC-10|0.12|0.37|109.00
Souvenir MAC-10 | Sienna Damask (Factory New)|Consumer Grade|1364|MAC-10|0.12|0.37|109.00
SSG 08 | Prey (Factory New)|Consumer Grade|1365|SSG 08|0.06|0.15|74.00
Souvenir SSG 08 | Prey (Factory New)|Consumer Grade|1365|SSG 08|0.06|0.15|74.00
Dual Berettas | Drift Wood (Factory New)|Industrial Grade|1366|Dual Berettas|0.08|0.31|71.00
Souvenir Dual Berettas | Drift Wood (Factory New)|Industrial Grade|1366|Dual Berettas|0.08|0.31|71.00
FAMAS | CaliCamo (Factory New)|Industrial Grade|1367|FAMAS|0.08|0.37|124.00
Souvenir FAMAS | CaliCamo (Factory New)|Industrial Grade|1367|FAMAS|0.08|0.37|124.00
CZ75-Auto | Midnight Palm (Factory New)|Industrial Grade|1368|CZ75-Auto|0.25|0.03|79.00
Souvenir CZ75-Auto | Midnight Palm (Factory New)|Industrial Grade|1368|CZ75-Auto|0.25|0.03|79.00
P90 | Verdant Growth (Factory New)|Industrial Grade|1369|P90|0.21|0.28|81.00
Souvenir P90 | Verdant Growth (Factory New)|Industrial Grade|1369|P90|0.21|0.28|81.00
USP-S | Purple DDPAT (Factory New)|Mil-Spec|1370|USP-S|0.74|0.27|67.00
Souvenir USP-S | Purple DDPAT (Factory New)|Mil-Spec|1370|USP-S|0.74|0.27|67.00
MP9 | Music Box (Factory New)|Mil-Spec|1371|MP9|0.09|0.25|67.00
Souvenir MP9 | Music Box (Factory New)|Mil-Spec|1371|MP9|0.09|0.25|67.00
M249 | Humidor (Factory New)|Mil-Spec|1372|M249|0.05|0.28|85.00
Souvenir M249 | Humidor (Factory New)|Mil-Spec|1372|M249|0.05|0.28|85.00
SG 553 | Desert Blossom (Factory New)|Mil-Spec|1373|SG 553|0.06|0.17|88.00
Souvenir SG 553 | Desert Blossom (Factory New)|Mil-Spec|1373|SG 553|0.06|0.17|88.00
XM1014 | Elegant Vines (Factory New)|Restricted|1374|XM1014|0.17|0.12|68.00
Souvenir XM1014 | Elegant Vines (Factory New)|Restricted|1374|XM1014|0.17|0.12|68.00
Glock-18 | Pink DDPAT (Factory New)|Restricted|1375|Glock-18|0.89|0.35|94.00
Souvenir Glock-18 | Pink DDPAT (Factory New)|Restricted|1375|Glock-18|0.89|0.35|94.00
AUG | Sand Storm (Factory New)|Restricted|1376|AUG|0.07|0.32|95.00
Souvenir AUG | Sand Storm (Factory New)|Restricted|1376|AUG|0.07|0.32|95.00
MP5-SD | Oxide Oasis (Factory New)|Classified|1377|MP5-SD|0.08|0.40|126.00
Souvenir MP5-SD | Oxide Oasis (Factory New)|Classified|1377|MP5-SD|0.08|0.40|126.00
Desert Eagle | Fennec Fox (Factory New)|Classified|1378|Desert Eagle|0.05|0.48|91.00
Souvenir Desert Eagle | Fennec Fox (Factory New)|Classified|1378|Desert Eagle|0.05|0.48|91.00
AWP | Desert Hydra (Factory New)|Covert|1379|AWP|0.05|0.37|140.00
Souvenir AWP | Desert Hydra (Factory New)|Covert|1379|AWP|0.05|0.37|140.00
Desert Eagle | Sputnik (Factory New)|Mil-Spec|1380|Desert Eagle|0.59|0.25|87.00
M4A1-S | Fizzy POP (Factory New)|Mil-Spec|1381|M4A1-S|0.12|0.33|149.00
SSG 08 | Spring Twilly (Factory New)|Mil-Spec|1382|SSG 08|0.17|0.24|90.00
AUG | Amber Fade (Factory New)|Mil-Spec|1383|AUG|0.12|0.17|84.00
UMP-45 | Full Stop (Factory New)|Mil-Spec|1384|UMP-45|0.04|0.33|86.00
Tec-9 | Safety Net (Factory New)|Mil-Spec|1385|Tec-9|0.07|0.65|125.00
R8 Revolver | Blaze (Factory New)|Mil-Spec|1386|R8 Revolver|0.07|0.40|80.00
CZ75-Auto | Syndicate (Factory New)|Restricted|1387|CZ75-Auto|0.13|0.44|98.00
AWP | POP AWP (Factory New)|Restricted|1388|AWP|0.96|0.04|89.00
P2000 | Space Race (Factory New)|Restricted|1389|P2000|0.06|0.22|95.00
MP5-SD | Autumn Twilly (Factory New)|Restricted|1390|MP5-SD|0.07|0.35|104.00
Nova | Red Quartz (Factory New)|Restricted|1391|Nova|0.07|0.41|58.00
FAMAS | Meltdown (Factory New)|Classified|1392|FAMAS|0.12|0.45|58.00
MAC-10 | Propaganda (Factory New)|Classified|1393|MAC-10|0.05|0.41|175.00
USP-S | Whiteout (Factory New)|Classified|1394|USP-S|0.15|0.08|199.00
M4A4 | The Coalition (Factory New)|Covert|1396|M4A4|0.14|0.40|78.00
MAC-10 | Strats (Factory New)|Consumer Grade|1397|MAC-10|0.27|0.05|101.00
Souvenir MAC-10 | Strats (Factory New)|Consumer Grade|1397|MAC-10|0.27|0.05|101.00
FAMAS | Faulty Wiring (Factory New)|Consumer Grade|1398|FAMAS|0.13|0.11|82.00
Souvenir FAMAS | Faulty Wiring (Factory New)|Consumer Grade|1398|FAMAS|0.13|0.11|82.00
XM1014 | Blue Tire (Factory New)|Consumer Grade|1399|XM1014|0.28|0.04|75.00
Souvenir XM1014 | Blue Tire (Factory New)|Consumer Grade|1399|XM1014|0.28|0.04|75.00
CZ75-Auto | Framework (Factory New)|Consumer Grade|1400|CZ75-Auto|0.13|0.12|127.00
Souvenir CZ75-Auto | Framework (Factory New)|Consumer Grade|1400|CZ75-Auto|0.13|0.12|127.00
Dual Berettas | Oil Change (Factory New)|Consumer Grade|1401|Dual Berettas|0.09|0.27|55.00
Souvenir Dual Berettas | Oil Change (Factory New)|Consumer Grade|1401|Dual Berettas|0.09|0.27|55.00
Glock-18 | Red Tire (Factory New)|Industrial Grade|1402|Glock-18|0.11|0.11|79.00
Souvenir Glock-18 | Red Tire (Factory New)|Industrial Grade|1402|Glock-18|0.11|0.11|79.00
UMP-45 | Mechanism (Factory New)|Industrial Grade|1403|UMP-45|0.12|0.17|75.00
Souvenir UMP-45 | Mechanism (Factory New)|Industrial Grade|1403|UMP-45|0.12|0.17|75.00
SSG 08 | Carbon Fiber (Factory New)|Industrial Grade|1404|SSG 08|0.17|0.05|56.00
Souvenir SSG 08 | Carbon Fiber (Factory New)|Industrial Grade|1404|SSG 08|0.17|0.05|56.00
PP-Bizon | Breaker Box (Factory New)|Industrial Grade|1405|PP-Bizon|0.07|0.10|71.00
Souvenir PP-Bizon | Breaker Box (Factory New)|Industrial Grade|1405|PP-Bizon|0.07|0.10|71.00
AK-47 | Green Laminate (Factory New)|Mil-Spec|1406|AK-47|0.24|0.18|79.00
Souvenir AK-47 | Green Laminate (Factory New)|Mil-Spec|1406|AK-47|0.24|0.18|79.00
P90 | Schematic (Factory New)|Mil-Spec|1407|P90|0.15|0.06|128.00
Souvenir P90 | Schematic (Factory New)|Mil-Spec|1407|P90|0.15|0.06|128.00
Nova | Interlock (Factory New)|Mil-Spec|1408|Nova|0.14|0.31|105.00
Souvenir Nova | Interlock (Factory New)|Mil-Spec|1408|Nova|0.14|0.31|105.00
Negev | Infrastructure (Factory New)|Mil-Spec|1409|Negev|0.09|0.32|90.00
Souvenir Negev | Infrastructure (Factory New)|Mil-Spec|1409|Negev|0.09|0.32|90.00
Galil AR | CAUTION! (Factory New)|Restricted|1410|Galil AR|0.14|0.52|143.00
Souvenir Galil AR | CAUTION! (Factory New)|Restricted|1410|Galil AR|0.14|0.52|143.00
MAG-7 | Prism Terrace (Factory New)|Restricted|1411|MAG-7|0.18|0.12|93.00
Souvenir MAG-7 | Prism Terrace (Factory New)|Restricted|1411|MAG-7|0.18|0.12|93.00
P250 | Digital Architect (Factory New)|Restricted|1412|P250|0.61|0.23|125.00
Souvenir P250 | Digital Architect (Factory New)|Restricted|1412|P250|0.61|0.23|125.00
Five-SeveN | Fall Hazard (Factory New)|Classified|1413|Five-SeveN|0.38|0.16|113.00
Souvenir Five-SeveN | Fall Hazard (Factory New)|Classified|1413|Five-SeveN|0.38|0.16|113.00
SG 553 | Hazard Pay (Factory New)|Classified|1414|SG 553|0.13|0.66|130.00
Souvenir SG 553 | Hazard Pay (Factory New)|Classified|1414|SG 553|0.13|0.66|130.00
M4A1-S | Imminent Danger (Factory New)|Covert|1415|M4A1-S|0.15|0.10|78.00
Souvenir M4A1-S | Imminent Danger (Factory New)|Covert|1415|M4A1-S|0.15|0.10|78.00
AUG | Plague (Factory New)|Mil-Spec|1416|AUG|0.10|0.12|64.00
Dual Berettas | Tread (Factory New)|Mil-Spec|1417|Dual Berettas|0.12|0.11|70.00
G3SG1 | Keeping Tabs (Factory New)|Mil-Spec|1418|G3SG1|0.10|0.15|68.00
MP7 | Guerrilla (Factory New)|Mil-Spec|1419|MP7|0.13|0.21|72.00
PP-Bizon | Lumen (Factory New)|Mil-Spec|1420|PP-Bizon|0.17|0.02|62.00
USP-S | Black Lotus (Factory New)|Mil-Spec|1421|USP-S|0.58|0.07|87.00
XM1014 | Watchdog (Factory New)|Mil-Spec|1422|XM1014|0.18|0.19|73.00
MAG-7 | BI83 Spectrum (Factory New)|Restricted|1423|MAG-7|0.25|0.04|55.00
FAMAS | ZX Spectron (Factory New)|Restricted|1424|FAMAS|0.07|0.12|60.00
Five-SeveN | Boost Protocol (Factory New)|Restricted|1425|Five-SeveN|0.01|0.15|103.00
MP9 | Mount Fuji (Factory New)|Restricted|1426|MP9|0.80|0.08|110.00
M4A4 | Spider Lily (Factory New)|Restricted|1427|M4A4|0.50|0.03|69.00
MAC-10 | Toybox (Factory New)|Classified|1428|MAC-10|0.12|0.22|135.00
Glock-18 | Snack Attack (Factory New)|Classified|1429|Glock-18|0.07|0.39|129.00
SSG 08 | Turbo Peek (Factory New)|Classified|1430|SSG 08|0.93|0.26|87.00
Desert Eagle | Ocean Drive (Factory New)|Covert|1431|Desert Eagle|0.93|0.39|115.00
AK-47 | Leet Museo (Factory New)|Covert|1432|AK-47|0.14|0.09|77.00
★ Bowie Knife | Freehand (Factory New)|Covert|1434|Bowie Knife|0.69|0.16|114.00
★ Bowie Knife | Lore (Factory New)|Covert|1435|Bowie Knife|0.15|0.45|137.00
★ Bowie Knife | Autotronic (Factory New)|Covert|1436|Bowie Knife|0.00|0.30|141.00
★ Bowie Knife | Black Laminate (Factory New)|Covert|1437|Bowie Knife|0.25|0.04|105.00
★ Bowie Knife | Bright Water (Factory New)|Covert|1438|Bowie Knife|0.60|0.39|115.00
★ Butterfly Knife | Freehand (Factory New)|Covert|1440|Butterfly Knife|0.69|0.17|90.00
★ Butterfly Knife | Lore (Factory New)|Covert|1441|Butterfly Knife|0.14|0.48|119.00
★ Butterfly Knife | Autotronic (Factory New)|Covert|1442|Butterfly Knife|0.94|0.04|76.00
★ Butterfly Knife | Black Laminate (Factory New)|Covert|1443|Butterfly Knife|0.46|0.05|84.00
★ Butterfly Knife | Bright Water (Factory New)|Covert|1444|Butterfly Knife|0.60|0.38|94.00
★ Falchion Knife | Freehand (Factory New)|Covert|1446|Falchion Knife|0.71|0.11|134.00
★ Falchion Knife | Lore (Factory New)|Covert|1447|Falchion Knife|0.15|0.38|132.00
★ Falchion Knife | Autotronic (Factory New)|Covert|1448|Falchion Knife|0.00|0.13|111.00
★ Falchion Knife | Black Laminate (Factory New)|Covert|1449|Falchion Knife|0.20|0.04|119.00
★ Falchion Knife | Bright Water (Factory New)|Covert|1450|Falchion Knife|0.60|0.36|129.00
★ Huntsman Knife | Freehand (Factory New)|Covert|1452|Huntsman Knife|0.68|0.13|108.00
★ Huntsman Knife | Lore (Factory New)|Covert|1453|Huntsman Knife|0.14|0.48|154.00
★ Huntsman Knife | Autotronic (Factory New)|Covert|1454|Huntsman Knife|0.97|0.36|138.00
★ Huntsman Knife | Black Laminate (Factory New)|Covert|1455|Huntsman Knife|0.25|0.04|108.00
★ Huntsman Knife | Bright Water (Factory New)|Covert|1456|Huntsman Knife|0.59|0.32|106.00
★ Shadow Daggers | Freehand (Factory New)|Covert|1458|Shadow Daggers|0.75|0.15|198.00
★ Shadow Daggers | Lore (Factory New)|Covert|1459|Shadow Daggers|0.13|0.52|192.00
★ Shadow Daggers | Autotronic (Factory New)|Covert|1460|Shadow Daggers|0.96|0.34|180.00
★ Shadow Daggers | Black Laminate (Factory New)|Covert|1461|Shadow Daggers|0.20|0.04|130.00
★ Shadow Daggers | Bright Water (Factory New)|Covert|1462|Shadow Daggers|0.60|0.41|128.00
Five-SeveN | Scrawl (Factory New)|Mil-Spec|1463|Five-SeveN|0.16|0.20|122.00
MAC-10 | Ensnared (Factory New)|Mil-Spec|1464|MAC-10|0.14|0.07|94.00
MAG-7 | Foresight (Factory New)|Mil-Spec|1465|MAG-7|0.58|0.05|37.00
MP5-SD | Necro Jr. (Factory New)|Mil-Spec|1466|MP5-SD|0.08|0.17|93.00
P2000 | Lifted Spirits (Factory New)|Mil-Spec|1467|P2000|0.09|0.21|90.00
SCAR-20 | Poultrygeist (Factory New)|Mil-Spec|1468|SCAR-20|0.83|0.09|54.00
Sawed-Off | Spirit Board (Factory New)|Mil-Spec|1469|Sawed-Off|0.09|0.33|106.00
PP-Bizon | Space Cat (Factory New)|Restricted|1470|PP-Bizon|0.78|0.10|97.00
G3SG1 | Dream Glade (Factory New)|Restricted|1471|G3SG1|0.40|0.23|86.00
M4A1-S | Night Terror (Factory New)|Restricted|1472|M4A1-S|0.06|0.20|56.00
XM1014 | Zombie Offensive (Factory New)|Restricted|1473|XM1014|0.10|0.21|85.00
USP-S | Ticket to Hell (Factory New)|Restricted|1474|USP-S|0.17|0.08|85.00
Dual Berettas | Melondrama (Factory New)|Classified|1475|Dual Berettas|0.88|0.14|88.00
FAMAS | Rapid Eye Movement (Factory New)|Classified|1476|FAMAS|0.88|0.30|71.00
MP7 | Abyssal Apparition (Factory New)|Classified|1477|MP7|0.10|0.40|113.00
AK-47 | Nightwish (Factory New)|Covert|1478|AK-47|0.95|0.15|93.00
MP9 | Starlight Protector (Factory New)|Covert|1479|MP9|0.09|0.23|111.00
FAMAS | Meow 36 (Factory New)|Mil-Spec|1480|FAMAS|0.24|0.24|85.00
Galil AR | Destroyer (Factory New)|Mil-Spec|1481|Galil AR|0.25|0.04|46.00
M4A4 | Poly Mag (Factory New)|Mil-Spec|1482|M4A4|0.09|0.35|118.00
MAC-10 | Monkeyflage (Factory New)|Mil-Spec|1483|MAC-10|0.11|0.25|124.00
Negev | Drop Me (Factory New)|Mil-Spec|1484|Negev|0.08|0.34|98.00
UMP-45 | Roadblock (Factory New)|Mil-Spec|1485|UMP-45|0.11|0.06|48.00
Glock-18 | Winterized (Factory New)|Mil-Spec|1486|Glock-18|0.13|0.12|82.00
R8 Revolver | Crazy 8 (Factory New)|Restricted|1487|R8 Revolver|0.73|0.20|93.00
M249 | Downtown (Factory New)|Restricted|1488|M249|0.68|0.28|120.00
SG 553 | Dragon Tech (Factory New)|Restricted|1489|SG 553|0.39|0.21|87.00
P90 | Vent Rush (Factory New)|Restricted|1490|P90|0.06|0.12|52.00
Dual Berettas | Flora Carnivora (Factory New)|Restricted|1491|Dual Berettas|0.74|0.15|104.00
AK-47 | Ice Coaled (Factory New)|Classified|1492|AK-47|0.50|0.39|64.00
P250 | Visions (Factory New)|Classified|1493|P250|0.23|0.19|70.00
Sawed-Off | Kiss♥Love (Factory New)|Classified|1494|Sawed-Off|0.84|0.24|95.00
USP-S | Printstream (Factory New)|Covert|1495|USP-S|0.12|0.06|136.00
AWP | Chromatic Aberration (Factory New)|Covert|1496|AWP|0.83|0.34|70.00
MAG-7 | Insomnia (Factory New)|Mil-Spec|1497|MAG-7|0.04|0.48|101.00
MP9 | Featherweight (Factory New)|Mil-Spec|1498|MP9|0.17|0.07|86.00
SCAR-20 | Fragments (Factory New)|Mil-Spec|1499|SCAR-20|0.09|0.15|60.00
P250 | Re.built (Factory New)|Mil-Spec|1500|P250|0.11|0.08|119.00
MP5-SD | Liquidation (Factory New)|Mil-Spec|1501|MP5-SD|0.61|0.20|79.00
SG 553 | Cyberforce (Factory New)|Mil-Spec|1502|SG 553|0.05|0.15|86.00
Tec-9 | Rebel (Factory New)|Mil-Spec|1503|Tec-9|0.12|0.21|96.00
M4A1-S | Emphorosaur-S (Factory New)|Restricted|1504|M4A1-S|0.24|0.48|111.00
Glock-18 | Umbral Rabbit (Factory New)|Restricted|1505|Glock-18|0.08|0.38|154.00
R8 Revolver | Banana Cannon (Factory New)|Restricted|1507|R8 Revolver|0.13|0.60|114.00
P90 | Neoqueen (Factory New)|Restricted|1508|P90|0.05|0.13|83.00
UMP-45 | Wild Child (Factory New)|Classified|1509|UMP-45|0.04|0.11|128.00
P2000 | Wicked Sick (Factory New)|Classified|1510|P2000|0.86|0.17|134.00
AK-47 | Head Shot (Factory New)|Covert|1511|AK-47|0.13|0.19|110.00
M4A4 | Temukau (Factory New)|Covert|1512|M4A4|0.58|0.13|143.00
AWP | Duality (Factory New)|Classified|1513|AWP|0.07|0.16|64.00
R8 Revolver | Inlay (Factory New)|Consumer Grade|1514|R8 Revolver|0.10|0.21|81.00
Souvenir R8 Revolver | Inlay (Factory New)|Consumer Grade|1514|R8 Revolver|0.10|0.21|81.00
M249 | Submerged (Factory New)|Consumer Grade|1515|M249|0.10|0.22|83.00
Souvenir M249 | Submerged (Factory New)|Consumer Grade|1515|M249|0.10|0.22|83.00
XM1014 | Hieroglyph (Factory New)|Consumer Grade|1516|XM1014|0.08|0.31|142.00
Souvenir XM1014 | Hieroglyph (Factory New)|Consumer Grade|1516|XM1014|0.08|0.31|142.00
MP7 | Sunbaked (Factory New)|Consumer Grade|1517|MP7|0.08|0.16|63.00
Souvenir MP7 | Sunbaked (Factory New)|Consumer Grade|1517|MP7|0.08|0.16|63.00
AUG | Snake Pit (Factory New)|Consumer Grade|1518|AUG|0.11|0.23|87.00
Souvenir AUG | Snake Pit (Factory New)|Consumer Grade|1518|AUG|0.11|0.23|87.00
M4A1-S | Mud-Spec (Factory New)|Industrial Grade|1519|M4A1-S|0.11|0.15|41.00
Souvenir M4A1-S | Mud-Spec (Factory New)|Industrial Grade|1519|M4A1-S|0.11|0.15|41.00
SSG 08 | Azure Glyph (Factory New)|Industrial Grade|1520|SSG 08|0.17|0.09|53.00
Souvenir SSG 08 | Azure Glyph (Factory New)|Industrial Grade|1520|SSG 08|0.17|0.09|53.00
MAC-10 | Echoing Sands (Factory New)|Industrial Grade|1521|MAC-10|0.10|0.23|124.00
Souvenir MAC-10 | Echoing Sands (Factory New)|Industrial Grade|1521|MAC-10|0.10|0.23|124.00
USP-S | Desert Tactical (Factory New)|Industrial Grade|1522|USP-S|0.10|0.21|76.00
Souvenir USP-S | Desert Tactical (Factory New)|Industrial Grade|1522|USP-S|0.10|0.21|76.00
AK-47 | Steel Delta (Factory New)|Mil-Spec|1523|AK-47|0.10|0.11|47.00
Souvenir AK-47 | Steel Delta (Factory New)|Mil-Spec|1523|AK-47|0.10|0.11|47.00
AWP | Black Nile (Factory New)|Mil-Spec|1524|AWP|0.13|0.15|60.00
Souvenir AWP | Black Nile (Factory New)|Mil-Spec|1524|AWP|0.13|0.15|60.00
Tec-9 | Mummy's Rot (Factory New)|Mil-Spec|1525|Tec-9|0.10|0.33|79.00
Souvenir Tec-9 | Mummy's Rot (Factory New)|Mil-Spec|1525|Tec-9|0.10|0.33|79.00
MAG-7 | Copper Coated (Factory New)|Mil-Spec|1526|MAG-7|0.10|0.14|50.00
Souvenir MAG-7 | Copper Coated (Factory New)|Mil-Spec|1526|MAG-7|0.10|0.14|50.00
Glock-18 | Ramese's Reach (Factory New)|Restricted|1527|Glock-18|0.10|0.52|124.00
Souvenir Glock-18 | Ramese's Reach (Factory New)|Restricted|1527|Glock-18|0.10|0.52|124.00
Nova | Sobek's Bite (Factory New)|Restricted|1528|Nova|0.10|0.28|36.00
Souvenir Nova | Sobek's Bite (Factory New)|Restricted|1528|Nova|0.10|0.28|36.00
P90 | ScaraB Rush (Factory New)|Restricted|1529|P90|0.11|0.36|105.00
Souvenir P90 | ScaraB Rush (Factory New)|Restricted|1529|P90|0.11|0.36|105.00
FAMAS | Waters of Nephthys (Factory New)|Classified|1530|FAMAS|0.46|0.33|130.00
Souvenir FAMAS | Waters of Nephthys (Factory New)|Classified|1530|FAMAS|0.46|0.33|130.00
P250 | Apep's Curse (Factory New)|Classified|1531|P250|0.10|0.46|71.00
Souvenir P250 | Apep's Curse (Factory New)|Classified|1531|P250|0.10|0.46|71.00
M4A4 | Eye of Horus (Factory New)|Covert|1532|M4A4|0.13|0.34|86.00
Souvenir M4A4 | Eye of Horus (Factory New)|Covert|1532|M4A4|0.13|0.34|86.00
Tec-9 | Slag (Factory New)|Mil-Spec|1533|Tec-9|0.10|0.14|99.00
XM1014 | Irezumi (Factory New)|Mil-Spec|1534|XM1014|0.12|0.18|82.00
UMP-45 | Motorized (Factory New)|Mil-Spec|1535|UMP-45|0.11|0.09|66.00
SSG 08 | Dezastre (Factory New)|Mil-Spec|1536|SSG 08|0.42|0.03|73.00
Dual Berettas | Hideout (Factory New)|Mil-Spec|1537|Dual Berettas|0.07|0.20|92.00
Nova | Dark Sigil (Factory New)|Mil-Spec|1538|Nova|0.09|0.24|76.00
MAC-10 | Light Box (Factory New)|Mil-Spec|1539|MAC-10|0.60|0.07|70.00
Glock-18 | Block-18 (Factory New)|Restricted|1540|Glock-18|0.10|0.15|130.00
M4A4 | Etch Lord (Factory New)|Restricted|1541|M4A4|0.11|0.11|54.00
MP7 | Just Smile (Factory New)|Restricted|1542|MP7|0.29|0.06|111.00
Sawed-Off | Analog Input (Factory New)|Restricted|1543|Sawed-Off|0.09|0.28|85.00
Five-SeveN | Hybrid (Factory New)|Restricted|1544|Five-SeveN|0.77|0.21|80.00
M4A1-S | Black Lotus (Factory New)|Classified|1545|M4A1-S|0.72|0.17|58.00
Zeus x27 | Olympus (Factory New)|Classified|1546|Zeus x27|0.58|0.18|114.00
USP-S | Jawbreaker (Factory New)|Classified|1547|USP-S|0.97|0.08|78.00
AWP | Chrome Cannon (Factory New)|Covert|1548|AWP|0.03|0.10|61.00
AK-47 | Inheritance (Factory New)|Covert|1549|AK-47|0.17|0.01|116.00
★ Kukri Knife | Forest DDPAT (Factory New)|Covert|1550|Kukri Knife|0.22|0.24|122.00
★ Kukri Knife | Fade (Factory New)|Covert|1552|Kukri Knife|0.02|0.36|104.00
★ Kukri Knife | Blue Steel (Factory New)|Covert|1553|Kukri Knife|0.58|0.19|70.00
★ Kukri Knife | Stained (Factory New)|Covert|1554|Kukri Knife|0.55|0.07|96.00
★ Kukri Knife | Case Hardened (Factory New)|Covert|1555|Kukri Knife|0.64|0.07|105.00
★ Kukri Knife | Slaughter (Factory New)|Covert|1556|Kukri Knife|0.00|0.40|118.00
★ Kukri Knife | Safari Mesh (Factory New)|Covert|1557|Kukri Knife|0.18|0.18|120.00
★ Kukri Knife | Boreal Forest (Factory New)|Covert|1558|Kukri Knife|0.16|0.17|115.00
★ Kukri Knife | Urban Masked (Factory New)|Covert|1559|Kukri Knife|0.33|0.02|165.00
★ Kukri Knife | Scorched (Factory New)|Covert|1560|Kukri Knife|0.11|0.06|99.00
★ Kukri Knife | Night Stripe (Factory New)|Covert|1561|Kukri Knife|0.56|0.21|85.00
★ Kukri Knife | Vanilla (Factory New)|Covert|1562|Kukri Knife|0.33|0.04|57.00`;

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
