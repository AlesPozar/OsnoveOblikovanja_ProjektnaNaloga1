from colorsys import rgb_to_hsv
from datasets import load_dataset
from huggingface_hub import hf_hub_download
from huggingface_hub.errors import RemoteEntryNotFoundError
from PIL import Image
from pathlib import Path
from colorama import init, Fore, Style

init(autoreset=True)

dataset = load_dataset("While402/CounterStrike2Skins", split="metadata")

outputFile = open("single_dominant_color_whole222222.txt", "w", encoding="utf-8")

#Single Dominant Color Extractor, per whole gun, including the handle and other maybe not paintd parts, but excluding pure ish black/white
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

            #ez algorithm to find the dominant colot in one swipe trough the image <3
            rgb_values = [[[0 for _ in range(256)] for _ in range(256)] for _ in range(256)]
            maxCurCount = 0
            dominantColor = (0, 0, 0)
            excluded = {
                (0, 0, 0), (1, 1, 1), (2, 2, 2),
                (253, 253, 253), (254, 254, 254), (255, 255, 255),
            }
            for j in range(x):
                for k in range(y):
                    r, g, b, a = image.getpixel((j, k))
                    #skip transparent pixels, pure ish black pixels and pure ish white pixels
                    if a > 0 and (r, g, b) not in excluded:
                        rgb_values[r][g][b] += 1
                        if rgb_values[r][g][b] > maxCurCount:
                            maxCurCount = rgb_values[r][g][b]
                            dominantColor = (r, g, b)

            color_preview = (
                "\033[48;2;255;255;255m "
                f"\033[48;2;{dominantColor[0]};{dominantColor[1]};{dominantColor[2]}m        "
                "\033[48;2;255;255;255m "
                "\033[0m"
            )
            print(Fore.BLUE + f"Dominant color for {item['name']} is: {dominantColor} {color_preview}\n")

            #rgb -> hsv, and output
            r, g, b = dominantColor
            h, s, v = rgb_to_hsv(r, g, b)
            outputFile.write(f"{item['name']}|{item['rarity']}|{item['weapon']}|{h:.2f}|{s:.2f}|{v:.2f}\n")#format: name|rarity|weapon|hue|saturation|value, all are factory new!

        except RemoteEntryNotFoundError:
            print(f"Skipped: Image not found for {item['name']}")
            continue
outputFile.close()