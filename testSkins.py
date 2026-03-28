from datasets import load_dataset
from huggingface_hub import hf_hub_download
from PIL import Image

dataset = load_dataset("While402/CounterStrike2Skins", split="metadata")

#tuki sm sa m vzel pru sample data
first_sample = dataset[0]
print(f"Loading image for: {first_sample['name']}")
print(f"Image ID: {first_sample['imageid']}")

#to nalozi sliko iz Hugging Face Hub in jo shrani lokalno
image_path = hf_hub_download(
    repo_id="While402/CounterStrike2Skins",
    filename=f"images/{first_sample['imageid']}.png",
    repo_type="dataset"
)
image = Image.open(image_path)

#kle sm pa sam v repo savu da sm vidu kako zgleda slika hihi
output_filename = f"skin_{first_sample['imageid']}.png"
image.save(output_filename, "PNG")
