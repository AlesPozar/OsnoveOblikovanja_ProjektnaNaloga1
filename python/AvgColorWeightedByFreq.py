from colorsys import rgb_to_hsv
from datasets import load_dataset
from huggingface_hub import hf_hub_download
from huggingface_hub.errors import RemoteEntryNotFoundError
from PIL import Image
from pathlib import Path
from colorama import init, Fore, Style

init(autoreset=True)

dataset = load_dataset("While402/CounterStrike2Skins", split="metadata")

outputFile = open("weighted_average_colors.txt", "w", encoding="utf-8")

#Example 3*red and 1*blue -> (3*red + 1*blue) / 4, so the color is weighted by the frequency of the color in the image
#Average Weighted Color Extractor, per whole gun, including the handle and other maybe not paintd parts, but excluding pure ish black/white and statTrack items(stat track versions of normal skins)
for item in dataset:
    if(item["exterior"] == "Factory New" and "StatTrak" not in item["name"]):
        print("Weapon found\n")

        try:
            #Image from dataset
            imagePath = hf_hub_download(
                repo_id = "While402/CounterStrike2Skins",
                filename = f"images/{item['imageid']}.png",
                repo_type="dataset"
            )
            image = Image.open(imagePath)
            x, y = image.size
            #print("ImagePath: " + imagePath) #saved to cache

            excluded = {
                (0, 0, 0), (1, 1, 1), (2, 2, 2),
                (253, 253, 253), (254, 254, 254), (255, 255, 255),
            }

            avg_r = 0
            avg_g = 0
            avg_b = 0
            #logic
            for j in range(x):
                for k in range(y):
                    r, g, b, a = image.getpixel((j, k))
                    #skip transparent pixels, pure ish black pixels and pure ish white pixels
                    if a > 0 and (r, g, b) not in excluded:
                        avg_r += r
                        avg_g += g
                        avg_b += b

            #calculate the average color
            total_pixels = x * y
            if total_pixels > 0:
                avg_r //= total_pixels
                avg_g //= total_pixels
                avg_b //= total_pixels

            color_preview = (
                "\033[48;2;255;255;255m "
                f"\033[48;2;{avg_r};{avg_g};{avg_b}m        "
                "\033[48;2;255;255;255m "
                "\033[0m"
            )
            print(Fore.BLUE + f"Average weighted color for {item['name']} is: ({avg_r}, {avg_g}, {avg_b}) {color_preview}\n")

            #rgb -> hsv, and output
            r, g, b = avg_r, avg_g, avg_b
            h, s, v = rgb_to_hsv(r, g, b)
            outputFile.write(f"{item['name']}|{item['rarity']}|{item['weapon']}|{h:.2f}|{s:.2f}|{v:.2f}\n")#format: name|rarity|weapon|hue|saturation|value, all are factory new!

        except RemoteEntryNotFoundError:
            print(f"Skipped: Image not found for {item['name']}")
            continue
outputFile.close()