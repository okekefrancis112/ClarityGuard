# Master's Thesis Proposal

## Cross-lingual Visual Question Answering for Nigerian Languages

---

### Candidate Information

- **Name:** [Your Full Name]
- **Programme:** M.Sc. Computer Science
- **Institution:** [Your University]
- **Supervisor:** [Supervisor Name]
- **Date:** March 2026

---

## 1. Introduction

### 1.1 Background

Vision-Language Models (VLMs) have achieved remarkable progress in tasks such as image captioning, visual question answering (VQA), and visual reasoning. Models like LLaVA (Liu et al., 2023), GPT-4V (OpenAI, 2023), and Gemini (Google, 2024) demonstrate strong performance on English-centric benchmarks such as VQAv2, GQA, and TextVQA. However, their performance degrades significantly when applied to low-resource languages, particularly African languages, which remain severely underrepresented in both training data and evaluation benchmarks (Adelani et al., 2024).

The Hausa Visual Question Answering dataset (HaVQA; Parida et al., 2023) represents the first VQA benchmark for any African language, covering Hausa — a Chadic language spoken by over 80 million people across West Africa. HaVQA demonstrated that state-of-the-art VLMs perform poorly on Hausa VQA tasks, with significant gaps between English and Hausa performance. However, no equivalent benchmarks exist for other major Nigerian languages such as Yorùbá (approximately 47 million speakers) and Igbo (approximately 45 million speakers).

This gap presents both a research challenge and an opportunity. If cross-lingual transfer from a relatively better-resourced African language (Hausa, via HaVQA) can improve VLM performance on related but distinct Nigerian languages, it would provide a scalable pathway for extending VLM capabilities across Africa's 2,000+ languages without requiring expensive dataset creation for each language individually.

### 1.2 Problem Statement

Despite growing interest in multilingual NLP for African languages (Adelani et al., 2021; Adelani et al., 2022; Oladipo et al., 2023), the intersection of vision and language for these languages remains largely unexplored. Specifically:

1. **No VQA benchmarks exist for Yorùbá or Igbo.** Evaluation of VLM capabilities in these languages is therefore impossible.
2. **Cross-lingual transfer for VQA in African languages is unstudied.** While cross-lingual transfer has been explored for text-only tasks (NER, machine translation), its effectiveness for multimodal tasks involving African languages is unknown.
3. **Cultural and linguistic specificity is ignored.** Existing VQA datasets are built around Western-centric images and concepts, failing to capture the visual contexts relevant to Nigerian language speakers.

### 1.3 Research Questions

This thesis addresses the following research questions:

- **RQ1:** How do state-of-the-art Vision-Language Models (LLaVA, GPT-4o, Gemini) perform on visual question answering in Yorùbá and Igbo under zero-shot conditions?

- **RQ2:** Can cross-lingual transfer from Hausa VQA (HaVQA) improve VLM performance on Yorùbá and Igbo VQA in few-shot and fine-tuned settings?

- **RQ3:** What linguistic and visual factors most influence cross-lingual VQA transfer success between typologically diverse Nigerian languages?

### 1.4 Research Objectives

1. Construct **YorVQA** and **IgbVQA** — the first visual question answering datasets for Yorùbá and Igbo, respectively, comprising at least 500 image-question-answer triplets each.
2. Establish baseline performance of current VLMs on Yorùbá and Igbo VQA tasks.
3. Investigate cross-lingual transfer from Hausa (HaVQA) to Yorùbá and Igbo using parameter-efficient fine-tuning.
4. Analyse the factors (linguistic similarity, question type, visual complexity) that influence transfer effectiveness.
5. Release all datasets, models, and code as open-source resources.

---

## 2. Literature Review

### 2.1 Vision-Language Models

The development of VLMs has accelerated rapidly. Key milestones include:

- **CLIP** (Radford et al., 2021): Contrastive pre-training of image and text encoders on 400M image-text pairs, enabling zero-shot image classification.
- **LLaVA** (Liu et al., 2023): Visual instruction tuning connecting a CLIP vision encoder with a Vicuna language model, achieving strong performance on multimodal benchmarks.
- **LLaVA-1.5** (Liu et al., 2023b): Improved architecture with an MLP projection layer and higher-resolution inputs.
- **GPT-4V/GPT-4o** (OpenAI, 2023, 2024): Proprietary multimodal models with state-of-the-art performance across VQA, captioning, and reasoning tasks.
- **MoE-LLaVA** (Lin et al., 2024): Mixture-of-Experts approach to VLMs, enabling efficient scaling.

Despite these advances, multilingual VLM evaluation remains limited. Most benchmarks (VQAv2, GQA, TextVQA, POPE) are English-only.

### 2.2 African Language NLP

The Masakhane community (Orife et al., 2020) and subsequent research have established foundations for African NLP:

- **MasakhaNER** (Adelani et al., 2021) and **MasakhaNER 2.0** (Adelani et al., 2022): Named entity recognition benchmarks spanning 20+ African languages.
- **IrokoBench** (Adelani et al., 2024): Evaluation of LLMs across African languages on reasoning, comprehension, and mathematical tasks.
- **AfriMTEB and AfriE5** (Oladipo et al., 2025): Text embedding benchmarks and models for African languages.
- **WorldCuisines** (Winata et al., 2024): A multimodal benchmark testing VLM knowledge of world cuisines across languages, revealing poor performance on African dishes.

### 2.3 Visual Question Answering for Low-Resource Languages

VQA for low-resource languages is an emerging area:

- **HaVQA** (Parida et al., 2023): The first VQA dataset for an African language (Hausa), containing 1,555 images with Hausa and English question-answer pairs. Results showed significant performance gaps between English and Hausa.
- **xGQA** (Pfeiffer et al., 2022): A cross-lingual extension of GQA covering 7 languages, though no African languages were included.
- **MaXM** (Changpinyo et al., 2023): Multilingual VQA benchmark covering 7 languages, also excluding African languages.

### 2.4 Cross-lingual Transfer Learning

Cross-lingual transfer has proven effective for text-only tasks:

- **mBERT and XLM-R** (Conneau et al., 2020): Multilingual pre-training enables zero-shot cross-lingual transfer for NER, POS tagging, and classification.
- **African language transfer** (Adelani et al., 2022): MasakhaNER 2.0 demonstrated that transfer between related African languages improves NER performance.
- **Multimodal transfer**: Limited work exists on cross-lingual transfer for VQA. UC2 (Zhou et al., 2021) explored unsupervised cross-lingual VQA transfer but did not include African languages.

### 2.5 Research Gap

No study has investigated:
1. VQA capabilities in Yorùbá or Igbo
2. Cross-lingual VQA transfer between African languages
3. The interaction between linguistic typology and multimodal transfer effectiveness for African languages

This thesis addresses all three gaps.

---

## 3. Methodology

### 3.1 Overview

The research follows four phases:

```
Phase 1: Dataset Construction (Months 1–4)
    ↓
Phase 2: Baseline Evaluation (Months 4–6)
    ↓
Phase 3: Cross-lingual Transfer Experiments (Months 6–10)
    ↓
Phase 4: Analysis and Writing (Months 10–14)
```

### 3.2 Phase 1: Dataset Construction

#### 3.2.1 Image Selection

Images will be sourced from two pools:

1. **HaVQA shared images:** A subset of images from the HaVQA dataset will be re-annotated with Yorùbá and Igbo questions. This enables direct cross-lingual comparison on identical visual inputs.
2. **Culturally relevant images:** Additional images depicting scenes, objects, and activities familiar to Yorùbá and Igbo speakers will be sourced from:
   - Open-licensed image repositories (Wikimedia Commons, Flickr Creative Commons)
   - The AfriCaption dataset (if available)
   - Original photographs (with ethics approval)

**Target:** 600 images per language (400 shared with HaVQA + 200 culturally specific).

#### 3.2.2 Question-Answer Annotation

Native speakers of Yorùbá and Igbo will be recruited to generate question-answer pairs. The annotation protocol follows HaVQA's methodology:

- Each image receives 2–3 question-answer pairs
- Questions span categories: **object identification**, **counting**, **colour/attribute**, **spatial reasoning**, **action/activity**, and **cultural knowledge**
- Answers are short (1–5 words) to enable automatic evaluation
- All text uses standard orthography with appropriate diacritics (e.g., Yorùbá tonal marks)

**Annotator recruitment:**
- Minimum 4 annotators per language (2 primary + 2 for validation)
- Annotators must be native speakers with university-level education
- Inter-annotator agreement will be measured using Cohen's Kappa (κ ≥ 0.7 target)

#### 3.2.3 Quality Control

- **Dual annotation:** 20% of data will be independently annotated by two annotators
- **Expert review:** A linguist or language expert will review 10% of annotations for grammatical and orthographic correctness
- **Pilot study:** An initial batch of 50 annotations per language will be piloted and refined before full-scale annotation

#### 3.2.4 Dataset Format

The dataset will follow the standard VQA format:

```json
{
  "image_id": "yor_vqa_001",
  "image_path": "images/yor_vqa_001.jpg",
  "language": "yor",
  "questions": [
    {
      "question_id": "yor_vqa_001_q1",
      "question": "Kí ni àwọ̀ ẹ̀wù tí ọkùnrin náà wọ̀?",
      "answer": "pupa",
      "question_type": "colour",
      "english_translation": "What colour is the shirt the man is wearing?"
    }
  ]
}
```

### 3.3 Phase 2: Baseline Evaluation

#### 3.3.1 Models

The following models will be evaluated:

| Model | Type | Parameters | Access |
|-------|------|------------|--------|
| LLaVA-1.5-7B | Open-source | 7B | Local |
| LLaVA-1.5-13B | Open-source | 13B | Local |
| MoE-LLaVA | Open-source | 6.7B (active) | Local |
| GPT-4o | Proprietary | Unknown | API |
| Gemini 1.5 Pro | Proprietary | Unknown | API |

#### 3.3.2 Evaluation Settings

1. **Zero-shot:** Models are prompted with the image and question in the target language without any examples or fine-tuning.
2. **Few-shot (3-shot, 5-shot):** Models are provided with example image-question-answer triplets before the test query.
3. **English translation baseline:** Questions are machine-translated to English, answered by the VLM, and answers are translated back. This measures the "translate-test" upper bound.

#### 3.3.3 Evaluation Metrics

- **Exact Match Accuracy (EM):** Percentage of predictions exactly matching the reference answer.
- **Token-level F1 Score:** Overlap between predicted and reference answer tokens, accounting for morphological variation.
- **BERTScore:** Semantic similarity using multilingual BERT embeddings, to capture paraphrases.
- **Human Evaluation:** A random 10% subset will be evaluated by native speakers on a 3-point scale (correct / partially correct / incorrect).

### 3.4 Phase 3: Cross-lingual Transfer Experiments

#### 3.4.1 Fine-tuning Strategy

The primary fine-tuning approach uses **LoRA (Low-Rank Adaptation)** (Hu et al., 2022) applied to LLaVA-1.5-7B:

- **LoRA rank:** r = 16, 32, 64 (ablation)
- **Target modules:** Query and value projection layers in both the language model and the visual projection MLP
- **Training framework:** lmms-finetune (LMMs-Lab)

#### 3.4.2 Transfer Configurations

| Experiment | Training Data | Test Data | Purpose |
|-----------|--------------|-----------|---------|
| E1: Hausa-only | HaVQA (Hausa) | YorVQA, IgbVQA | Cross-lingual transfer from Hausa |
| E2: Yorùbá-only | YorVQA (train split) | YorVQA (test) | Monolingual baseline |
| E3: Igbo-only | IgbVQA (train split) | IgbVQA (test) | Monolingual baseline |
| E4: Hausa + Yorùbá | HaVQA + YorVQA | IgbVQA | Multi-source transfer |
| E5: Hausa + Igbo | HaVQA + IgbVQA | YorVQA | Multi-source transfer |
| E6: All three | HaVQA + YorVQA + IgbVQA | All (test splits) | Joint multilingual training |
| E7: English → Nigerian | VQAv2 (English subset) | YorVQA, IgbVQA | High-resource transfer baseline |

#### 3.4.3 Ablation Studies

- **Data size:** Training with 25%, 50%, 75%, 100% of available data to plot learning curves
- **LoRA rank:** r ∈ {16, 32, 64} to measure parameter-efficiency trade-offs
- **Image overlap:** Compare transfer performance on shared vs. non-shared images to isolate the effect of visual familiarity

### 3.5 Phase 4: Analysis

#### 3.5.1 Linguistic Factor Analysis

To address RQ3, we will analyse transfer effectiveness as a function of:

- **Language family distance:** Hausa (Chadic/Afroasiatic) vs. Yorùbá (Volta-Niger/Niger-Congo) vs. Igbo (Volta-Niger/Niger-Congo). Yorùbá and Igbo are more closely related to each other than either is to Hausa, predicting stronger mutual transfer.
- **Morphological complexity:** Igbo is largely isolating; Yorùbá is mildly agglutinative with tonal distinctions; Hausa has more complex morphology. We hypothesise that transfer to morphologically simpler languages will be more effective.
- **Question type:** Performance will be disaggregated by question type to identify which categories (e.g., counting, spatial reasoning) transfer most readily across languages.
- **Lexical overlap:** Loanwords and shared vocabulary between Nigerian languages may facilitate transfer for certain answer types.

#### 3.5.2 Error Analysis

A qualitative error analysis will be conducted on 100 randomly sampled errors per language, categorising failures as:

- Vision errors (model misidentifies visual content)
- Language errors (model understands the image but generates incorrect language)
- Cultural errors (model lacks cultural knowledge to answer correctly)
- Question misunderstanding (model fails to parse the question)

---

## 4. Ethical Considerations

### 4.1 Data Collection Ethics

- Annotators will be fairly compensated at rates above local minimum wage standards
- Informed consent will be obtained from all annotators
- Images will only be sourced from open-licensed repositories or captured with subjects' consent
- Ethics approval will be sought from the institutional review board prior to data collection

### 4.2 Bias and Representation

- Annotator demographics (region, dialect, gender) will be documented to assess potential biases
- The dataset will include diverse visual content representative of both urban and rural Nigerian contexts
- Limitations of the dataset's representativeness will be explicitly acknowledged

### 4.3 Open Science

All outputs will be released under permissive licences:
- **Datasets:** CC BY-SA 4.0
- **Model weights:** Apache 2.0
- **Code:** MIT Licence

---

## 5. Expected Contributions

1. **YorVQA and IgbVQA:** The first visual question answering datasets for Yorùbá and Igbo, expanding VQA coverage to three Nigerian languages.

2. **Cross-lingual VQA transfer analysis:** The first systematic study of cross-lingual transfer for VQA between African languages, providing evidence for or against the viability of transfer-based approaches for scaling multimodal AI to low-resource languages.

3. **Linguistic factor insights:** Analysis of how typological distance, morphological complexity, and question type influence multimodal cross-lingual transfer, informing future research on African and other low-resource language VLMs.

4. **Open-source resources:** All datasets, fine-tuned model weights, training scripts, and evaluation code will be publicly released, enabling reproducibility and further research.

5. **Practical impact:** Fine-tuned models that can answer visual questions in Yorùbá, Igbo, and Hausa, with applications in education, accessibility, and information access for Nigerian language speakers.

---

## 6. Timeline

| Period | Phase | Milestones |
|--------|-------|------------|
| Month 1–2 | Setup & Design | Literature review finalised; annotation guidelines drafted; annotators recruited; ethics approval submitted |
| Month 3–4 | Dataset Construction | Pilot annotation completed; full annotation in progress; quality control checks |
| Month 5 | Dataset Finalisation | Annotation completed; dataset cleaned and split (train/val/test: 70/15/15); dataset card published |
| Month 5–6 | Baseline Experiments | Zero-shot and few-shot evaluation of all models on HaVQA, YorVQA, IgbVQA |
| Month 7–9 | Transfer Experiments | All cross-lingual transfer experiments (E1–E7) completed; ablation studies run |
| Month 10–11 | Analysis | Linguistic factor analysis; error analysis; results compiled |
| Month 11 | Paper Submission | Submission to AfricaNLP Workshop or EMNLP 2027 |
| Month 12–14 | Thesis Writing | Full thesis drafted, reviewed, revised, and submitted |

---

## 7. Required Resources

### 7.1 Computational Resources

No dedicated GPU hardware or cloud rental is required. All training and evaluation will use freely available cloud GPU platforms:

| Resource | Specification | Cost | Purpose |
|----------|--------------|------|---------|
| Google Colab (Free) | NVIDIA T4 (15GB VRAM) | $0 | LoRA fine-tuning of LLaVA-7B (fits within 15GB using 4-bit quantisation + LoRA rank 16) |
| Kaggle Notebooks | 2× NVIDIA T4, 30 hrs/week | $0 | Extended training runs and ablation studies |
| Google Drive / Kaggle Datasets | 15–20 GB | $0 | Dataset and checkpoint storage |
| GPT-4o / Gemini API calls | Pay-per-token | ~$50–100 USD | Baseline evaluation of proprietary models (estimated 2,400 queries across both datasets) |

**Feasibility note:** LoRA (Low-Rank Adaptation) is specifically designed for memory-efficient fine-tuning. LLaVA-7B with 4-bit quantisation and LoRA rank 16 requires approximately 10–12 GB of VRAM, well within the 15 GB available on a free Google Colab T4 GPU. All seven transfer experiments (E1–E7) can be executed within Kaggle's weekly GPU allocation over 4–6 weeks.

### 7.2 Human Resources

| Role | Count | Duration | Estimated Cost |
|------|-------|----------|----------------|
| Yorùbá annotators | 4 | 6 weeks | $600–800 USD |
| Igbo annotators | 4 | 6 weeks | $600–800 USD |
| Linguistic reviewer | 1 per language | 2 weeks | $200–300 USD |
| **Total annotation budget** | | | **$1,400–1,900 USD** |

### 7.3 Software and Tools

- **lmms-finetune** (LMMs-Lab): Fine-tuning framework for LLaVA and related VLMs
- **HuggingFace Transformers and Datasets**: Model hosting and dataset distribution
- **Label Studio** or **Potato**: Annotation interface for VQA data collection
- **Weights & Biases**: Experiment tracking and visualisation

---

## 8. Risk Assessment and Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Annotator recruitment difficulty | Medium | High | Begin recruitment early; leverage university language departments and online communities; offer competitive compensation |
| Low inter-annotator agreement | Medium | Medium | Pilot study to refine guidelines; training session for annotators; iterative refinement |
| Negative transfer results | Low | Medium | Negative results are still publishable and informative; pivot analysis to understanding why transfer fails |
| Colab/Kaggle session limits | Low | Low | Split training into checkpoint-resumable runs; use Kaggle when Colab sessions expire; LoRA checkpoints are small (~50 MB) and easy to save/reload |
| Dataset too small for meaningful fine-tuning | Low | High | Supplement with data augmentation (back-translation, paraphrase generation); leverage HaVQA data in joint training |

---

## 9. Preliminary References

Adelani, D.I., Abbott, J., Neubig, G., et al. (2021). MasakhaNER: Named entity recognition for African languages. *Transactions of the Association for Computational Linguistics*, 9, 1116–1131.

Adelani, D.I., Abbott, J., Neubig, G., et al. (2022). MasakhaNER 2.0: Africa-centric transfer learning for named entity recognition. *Proceedings of EMNLP 2022*.

Adelani, D.I., Ojo, J., Oladipo, D., et al. (2024). IrokoBench: A new benchmark for African languages in the age of large language models. *arXiv preprint arXiv:2406.03368*.

Changpinyo, S., Kukliansky, D., Szpektor, I., et al. (2023). MaXM: Towards multilingual visual question answering. *Proceedings of EMNLP 2023*.

Conneau, A., Khandelwal, K., Goyal, N., et al. (2020). Unsupervised cross-lingual representation learning at scale. *Proceedings of ACL 2020*.

Hu, E.J., Shen, Y., Wallis, P., et al. (2022). LoRA: Low-rank adaptation of large language models. *Proceedings of ICLR 2022*.

Lin, B., Tang, Z., Ye, Y., et al. (2024). MoE-LLaVA: Mixture of experts for large vision-language models. *arXiv preprint arXiv:2401.15947*.

Liu, H., Li, C., Wu, Q., & Lee, Y.J. (2023). Visual instruction tuning. *Proceedings of NeurIPS 2023*.

Liu, H., Li, C., Li, Y., & Lee, Y.J. (2023b). Improved baselines with visual instruction tuning. *arXiv preprint arXiv:2310.03744*.

Oladipo, D., Adelani, D.I., Lin, J., & Frieder, O. (2023). Better quality pre-training data and T5 models for African languages. *Proceedings of EMNLP 2023*.

Oladipo, D., Dossou, B.F.P., Adelani, D.I., et al. (2025). AfriMTEB and AfriE5: Towards benchmarking and building text embedding models for African languages. *Proceedings of NAACL 2025*.

Orife, I., Kreutzer, J., Sibanda, B., et al. (2020). Masakhane — Machine translation for Africa. *Proceedings of AfricaNLP Workshop 2020*.

Parida, S., Bojar, O., & Dash, S.R. (2023). HaVQA: A dataset for visual question answering and grounding in Hausa. *Proceedings of EMNLP 2023 (Findings)*.

Pfeiffer, J., Geigle, G., Kamath, A., et al. (2022). xGQA: Cross-lingual visual question answering. *Proceedings of ACL 2022 (Findings)*.

Radford, A., Kim, J.W., Hallacy, C., et al. (2021). Learning transferable visual models from natural language supervision. *Proceedings of ICML 2021*.

Winata, G.I., Hudi, I., Adelani, D.I., et al. (2024). WorldCuisines: A massive-scale benchmark for multilingual and multicultural visual question answering on food images. *arXiv preprint arXiv:2410.12705*.

Zhou, M., Zhou, L., Wang, S., et al. (2021). UC2: Universal cross-lingual cross-modal vision-and-language pre-training. *Proceedings of CVPR 2021*.

---

## 10. Supervisor Endorsement

I have read this proposal and agree to supervise this research.

**Supervisor Name:** ____________________________

**Signature:** ____________________________

**Date:** ____________________________

---

*This proposal was prepared in March 2026.*
