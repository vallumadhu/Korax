import mediapipe as mp

mp_face_mesh = mp.solutions.face_mesh

face_mesh = mp_face_mesh.FaceMesh(
    static_image_mode=False,
    max_num_faces=1,
    refine_landmarks=True
)

LEFT_IRIS = [468, 469, 470, 471]
RIGHT_IRIS = [473, 474, 475, 476]

LEFT_EYE = [33, 133]
RIGHT_EYE = [362, 263]


def get_center(indices, landmarks, w, h):
    x = sum(landmarks[i].x for i in indices) / len(indices)
    y = sum(landmarks[i].y for i in indices) / len(indices)
    return int(x * w), int(y * h)


def track_eyes(image):
    import cv2

    rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    results = face_mesh.process(rgb)

    h, w, _ = image.shape

    if not results.multi_face_landmarks:
        return {"status": "no_face"}

    landmarks = results.multi_face_landmarks[0].landmark

    # 👉 Iris centers
    left_iris = get_center(LEFT_IRIS, landmarks, w, h)
    right_iris = get_center(RIGHT_IRIS, landmarks, w, h)

    # 👉 Eye corners (for direction)
    left_eye_left = landmarks[LEFT_EYE[0]]
    left_eye_right = landmarks[LEFT_EYE[1]]

    lx1 = left_eye_left.x * w
    lx2 = left_eye_right.x * w

    iris_x = left_iris[0]

    # 👉 Simple gaze detection
    if iris_x < lx1:
        gaze = "left"
    elif iris_x > lx2:
        gaze = "right"
    else:
        gaze = "center"

    return {
        "status": "ok",
        "left_iris": left_iris,
        "right_iris": right_iris,
        "gaze": gaze
    }