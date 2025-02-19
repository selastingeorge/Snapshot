import os
import cv2
import numpy as np

# 🔹 Define ROI (Region of Interest) - Adjust as needed
ROI = (500, 300, 900, 600)  # (x1, y1, x2, y2)
THRESHOLD = 20  # Minimum pixel intensity difference to count as a change
CHANGE_PERCENT_THRESHOLD = 10  # % change required to be considered significant


def load_screenshot_paths(folder_path):
    """
    Load all screenshot paths in sorted order.
    """
    files = [f for f in os.listdir(folder_path) if f.endswith(('.png', '.jpg', '.jpeg'))]
    files.sort(key=lambda x: int(x.split('_')[-1].split('.')[0]))  # Sort numerically
    return [os.path.join(folder_path, f) for f in files]


def detect_change_in_folder(folder_path):
    """
    Detects the first instance where a change occurs in a sequence of screenshots.
    """
    screenshot_paths = load_screenshot_paths(folder_path)

    if len(screenshot_paths) < 2:
        print("❌ Not enough images to compare. Need at least 2.")
        return

    first_image = cv2.imread(screenshot_paths[0], cv2.IMREAD_GRAYSCALE)  # Read as grayscale
    first_roi = first_image[ROI[1]:ROI[3], ROI[0]:ROI[2]]  # Extract ROI

    for i in range(1, len(screenshot_paths)):
        current_image = cv2.imread(screenshot_paths[i], cv2.IMREAD_GRAYSCALE)
        current_roi = current_image[ROI[1]:ROI[3], ROI[0]:ROI[2]]  # Extract ROI

        # Compute absolute difference
        diff = cv2.absdiff(first_roi, current_roi)

        # Threshold the difference
        _, thresholded = cv2.threshold(diff, THRESHOLD, 255, cv2.THRESH_BINARY)

        # Compute percentage of changed pixels
        change_percent = (np.count_nonzero(thresholded) / thresholded.size) * 100

        # If the change is significant, return the instance
        if change_percent > CHANGE_PERCENT_THRESHOLD:
            print(f"🚨 Change detected at {screenshot_paths[i]} with {change_percent:.2f}% change.")
            return screenshot_paths[i], change_percent

    print("✅ No significant change detected in the folder.")
    return None, 0.0


# 🔹 Example Usage
folder_path = "/home/selastin/Downloads/test/"
detect_change_in_folder(folder_path)