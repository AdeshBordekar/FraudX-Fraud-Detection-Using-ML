# 🚨 FraudX - Fraud Detection Using Machine Learning

## 📌 Overview

FraudX is a machine learning-based system designed to detect **fraudulent emails and phishing URLs**.
The system analyzes input data and predicts whether it is **Safe, Moderate, or High Risk**, helping users avoid scams and cyber threats.

---

## 🎯 Features

* 📧 Email Spam Detection
* 🔗 URL Phishing Detection
* 📊 Risk Score Prediction (Safe / Moderate / High Risk)
* 🧠 Machine Learning Models (trained on text data)
* 🌐 Full-stack Web Application (Frontend + Backend)
* 📈 Analytical dashboard 

---

## 🏗️ Project Structure

```
FraudX/
│
├── Backend/                # Server-side logic & ML integration
├── Frontend/              # User interface (React)
├── notebooks/             # Jupyter notebooks for model training
│     ├── Email-spam.ipynb
│     ├── URL-Phishing.ipynb
│
├── package.json           # Project dependencies
├── README.md              # Project documentation
```

---

## ⚙️ Technologies Used

* **Frontend:** React.js, CSS
* **Backend:** Flask
* **Machine Learning:** Python, Scikit-learn
* **Data Processing:** TF-IDF, NLP techniques
* **Database:** MongoDB

---

## 🧠 Machine Learning Approach

* Text data is preprocessed using:

  * Tokenization
  * Stopword removal
  * TF-IDF vectorization

* Model used:

  * Logistic Regression (for stable and interpretable results)

* The model predicts:

  * Email fraud
  * URL phishing

---

## 🚀 How It Works

1. User inputs an email or URL
2. Backend processes the data
3. ML model analyzes patterns
4. System returns:

   * Prediction (Safe / Fraudulent)
   * Risk score
   * Indicators detected

---

## ▶️ How to Run the Project

### 1. Clone Repository

```
git clone https://github.com/your-username/FraudX-Fraud-Detection-Using-ML.git
cd FraudX-Fraud-Detection-Using-ML
```

### 2. Install Dependencies

```
npm install
```

### 3. Run Backend

```
cd Backend
node server.js
```

### 4. Run Frontend

```
cd Frontend
npm start
```

---

## 📊 Future Enhancements

* Improve model accuracy with larger dataset
* Add real-time threat detection
* Integrate advanced AI models (Deep Learning)
* Deploy on cloud (AWS / Render / Vercel)

---

## ⚠️ Limitations

* Model is trained on a limited dataset
* May sometimes misclassify complex fraud cases
* Not a replacement for advanced security systems

---

## 👨‍💻 Author

**Adesh Bordekar**
Project: FraudX - Fraud Detection Using ML

---

## 💬 Conclusion

FraudX is a beginner-friendly yet practical project that demonstrates how machine learning can be used to detect cyber fraud and improve online safety.

---
