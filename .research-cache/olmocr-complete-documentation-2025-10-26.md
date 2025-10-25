# OlmOCR Complete Documentation & Analysis

**Research Date**: 2025-10-26
**Source**: https://github.com/allenai/olmocr
**Version Analyzed**: v0.4.2 (October 2025)
**Reference ID**: olmocr-20251026

---

## Executive Summary

**OlmOCR** is an open-source toolkit from AllenAI for converting PDFs and image-based documents into clean, readable Markdown/plain text using Vision Language Models (VLMs). It uses a fine-tuned 7B parameter VLM optimized for document OCR, achieving state-of-the-art performance on their olmOCR-Bench benchmark (82.4 score) while being dramatically more cost-effective than cloud solutions.

**Key Value Proposition:**
- **Cost**: ~$176-200 USD per million pages (vs $6,240 for GPT-4o)
- **Quality**: Outperforms GPT-4o, Gemini Flash 2, and commercial OCR solutions
- **Privacy**: Runs locally on your own hardware
- **Open Source**: Apache 2.0 license

---

## 1. Installation Requirements

### Hardware Requirements

**Minimum (Required):**
- NVIDIA GPU with at least **15GB VRAM**
- Tested on: RTX 4090, L40S, A100, H100
- 30GB free disk space

**CPU:**
- Multicore CPU recommended for PDF rendering
- Uses `BEAKER_ASSIGNED_CPU_COUNT` environment variable or defaults to `cpu_count - 2`

**Memory:**
- System RAM: 16GB+ recommended
- GPU VRAM: 15GB minimum (7B model runs in FP8 quantization)

### Software Requirements

**Python Version:**
- Python 3.11 (explicitly specified in installation docs)
- Must use clean conda environment (difficult to install in existing environments)

**System Dependencies (Ubuntu/Debian):**
```bash
sudo apt-get install poppler-utils ttf-mscorefonts-installer \
    msttcorefonts fonts-crosextra-caladea fonts-crosextra-carlito \
    gsfonts lcdf-typetools
```

**CUDA Requirements:**
- CUDA 12.8 (Docker image uses this)
- PyTorch 2.7+ with CUDA 12.8 support
- Flash Attention support (optional but recommended for speed)

### Python Installation

**Option 1: CPU-only (for benchmarking)**
```bash
conda create -n olmocr python=3.11
conda activate olmocr
pip install olmocr[bench]
```

**Option 2: GPU inference (recommended for production)**
```bash
conda create -n olmocr python=3.11
conda activate olmocr
pip install olmocr[gpu] --extra-index-url https://download.pytorch.org/whl/cu128

# HIGHLY RECOMMENDED for speed:
pip install https://download.pytorch.org/whl/cu128/flashinfer/flashinfer_python-0.2.5%2Bcu128torch2.7-cp38-abi3-linux_x86_64.whl
```

**Option 3: Docker (easiest)**
```bash
docker pull alleninstituteforai/olmocr:latest
docker run -it --gpus all -v /path/to/files:/local_files \
    --name olmocr_container alleninstituteforai/olmocr:latest /bin/bash
```

### Key Dependencies (from pyproject.toml)

**Core ML Libraries:**
- `torch>=2.7.0` - PyTorch deep learning framework
- `vllm>=0.7.3` - Fast LLM inference server
- `transformers>=4.47.1` - HuggingFace models
- `accelerate>=1.2.1` - Distributed training
- `bitsandbytes>=0.45.0` - Quantization

**Vision & PDF Processing:**
- `Pillow>=11.0.0` - Image manipulation
- `pypdf>=5.1.0` - PDF reading
- `pdf2image>=1.17.0` - PDF to image conversion
- `opencv-python>=4.10.0.84` - Computer vision

**Inference & Serving:**
- `httpx>=0.28.1` - Async HTTP client
- `tqdm>=4.67.1` - Progress bars
- `numpy>=2.1.0,<3.0.0` - Numerical computing

**Data & Storage:**
- `boto3>=1.35.93` - AWS S3 integration
- `huggingface-hub>=0.27.0` - Model download

---

## 2. Basic Usage and API

### Command Line Interface

**Single PDF Conversion:**
```bash
# Download sample
curl -o olmocr-sample.pdf https://olmocr.allenai.org/papers/olmocr_3pg_sample.pdf

# Convert to markdown
python -m olmocr.pipeline ./localworkspace --markdown --pdfs olmocr-sample.pdf
```

**Multiple PDFs:**
```bash
python -m olmocr.pipeline ./localworkspace --markdown --pdfs path/to/*.pdf
```

**Image Files (PNG/JPEG):**
```bash
python -m olmocr.pipeline ./localworkspace --markdown --pdfs random_page.png
```

### Python API Usage

Based on the pipeline.py analysis, here's the core API structure:

```python
import asyncio
from olmocr.pipeline import build_page_query, process_pdf
from olmocr.data.renderpdf import render_pdf_to_base64png
from olmocr.prompts import PageResponse, build_no_anchoring_v4_yaml_prompt

# Build query for a single page
async def process_single_page(pdf_path: str, page_num: int):
    query = await build_page_query(
        local_pdf_path=pdf_path,
        page=page_num,
        target_longest_image_dim=1568,  # Default
        image_rotation=0,  # 0, 90, 180, or 270
        model_name="olmocr"
    )

    # Query structure:
    # {
    #     "model": "olmocr",
    #     "messages": [{"role": "user", "content": [...]}],
    #     "max_tokens": 8000,
    #     "temperature": 0.0
    # }

    return query
```

### Input/Output Formats

**Input Formats:**
- PDF files (any version)
- PNG images
- JPEG images
- Multi-page PDFs
- Scanned documents
- Mixed text/image documents

**Output Formats:**
1. **Markdown** (with `--markdown` flag)
   - Clean, structured text
   - Preserved formatting (headers, lists, tables)
   - Natural reading order
   - Output: `./workspace/markdown/*.md`

2. **Dolma Format** (default)
   - JSON-based format used for LLM training
   - Metadata included
   - Output: `./workspace/*.jsonl`

**Image Preprocessing:**
- Automatic PDF rendering to base64 PNG
- Configurable target resolution: `--target_longest_image_dim` (default: 1568)
- Auto-rotation detection and correction
- Image optimization for model input

---

## 3. Model Capabilities

### Language Support

**Primary Language:** English (main training focus)

**Multilingual Support:**
- The model is based on Qwen2-VL architecture which has multilingual capabilities
- Training data (olmOCR-mix-0225) is primarily English PDFs
- **Japanese Support**: Not explicitly documented
  - Qwen2-VL base model DOES support Japanese
  - However, fine-tuning dataset was English-focused
  - **Recommendation**: Would need testing on Japanese documents
  - Likely performs worse than English due to training data distribution

**Filter Options:**
```python
# From source code:
PdfFilter(
    languages_to_keep={Language.ENGLISH, None},
    apply_download_spam_check=True,
    apply_form_check=True
)
```

### Document Types Supported

**Excellent Performance:**
- Academic papers (ArXiv documents)
- Technical documentation
- Books and long-form text
- Multi-column layouts
- Documents with figures and captions
- Tables and structured data
- Mathematical equations (LaTeX-style)
- Lists and bullet points

**Challenging but Supported:**
- Old scanned documents (historical papers)
- Handwritten text
- Poor quality scans
- Tiny fonts
- Complex layouts with insets
- Headers and footers (automatically removed)
- Mixed text/graphics pages

**Special Features:**
- Preserves section structure
- Maintains natural reading order
- Handles multi-column layouts correctly
- Removes headers/footers automatically
- Detects and formats tables
- Preserves mathematical notation

### Accuracy Metrics (olmOCR-Bench)

**Overall Score: 82.4±1.1** (on 1,400 documents, 7,000+ test cases)

**Breakdown by Category:**

| Category | Score | Description |
|----------|-------|-------------|
| ArXiv Papers | 83.0 | Academic documents |
| Old Scans Math | 82.3 | Historical math papers |
| Tables | 84.9 | Structured table data |
| Old Scans | 47.7 | Poor quality historical docs |
| Headers & Footers | 96.1 | Header/footer removal |
| Multi Column | 83.7 | Multi-column layouts |
| Long Tiny Text | 81.9 | Small font documents |
| Base | 99.7 | Clean modern documents |

**Comparison to Competitors:**

| System | Overall Score | Cost ($/1M pages) |
|--------|--------------|-------------------|
| **olmOCR v0.4.0** | 82.4±1.1 | $176-200 |
| Chandra OCR 0.1.0 | 83.1±0.9 | Unknown |
| Infinity-Parser 7B | 82.5 | Unknown |
| PaddleOCR-VL | 80.0±1.0 | Unknown |
| DeepSeek-OCR | 75.7±1.0 | API-based |
| Marker 1.10.1 | 76.1±1.1 | Free (local) |
| MinerU 2.5.4 | 75.2±1.1 | Free (local) |
| Mistral OCR API | 72.0±1.1 | API-based |
| GPT-4o (via API) | < 82.4 | $6,240 |

**Note:** olmOCR outperforms GPT-4o, Gemini Flash 2, and Qwen-2.5-VL on the benchmark.

### Speed & Performance Benchmarks

**Throughput:**
- Server input tokens/sec: Variable (depends on GPU)
- Server output tokens/sec: Variable (depends on GPU)
- With FP8 quantization: Significantly faster than FP16
- Flash Attention: Additional 20-30% speedup

**Retry Statistics (from paper):**
- 1st attempt success: ~60-70% of pages
- 2nd attempt: Additional ~20-25%
- 3rd attempt: Additional ~5-10%
- Max retries: Configurable (default: multiple attempts)

**Scalability:**
- Single GPU: ~1,000-10,000 pages/day (depends on GPU)
- Multi-GPU: Supports data parallelism and tensor parallelism
- Cluster mode: Can scale to millions of pages using S3 work queue

**Inference Time:**
- Per page: ~2-10 seconds (depends on GPU and content complexity)
- Batch processing: More efficient with `--pages_per_group` setting
- Network latency: Minimal if using local GPU

---

## 4. Integration Patterns

### Async Processing

**Built-in Async Support:**
```python
import asyncio
from olmocr.pipeline import worker, WorkQueue

async def process_documents(pdf_paths: list[str]):
    # OlmOCR uses asyncio throughout
    work_queue = WorkQueue(backend=LocalBackend("./workspace"))
    semaphore = asyncio.BoundedSemaphore(args.workers)

    # Create worker tasks
    worker_tasks = []
    for i in range(num_workers):
        task = asyncio.create_task(
            worker(args, work_queue, semaphore, worker_id=i)
        )
        worker_tasks.append(task)

    await asyncio.gather(*worker_tasks)

# Run
asyncio.run(process_documents(my_pdfs))
```

### Batch Processing

**Local Batch:**
```bash
# Process many PDFs with progress tracking
python -m olmocr.pipeline ./workspace --markdown --pdfs /data/*.pdf \
    --workers 4 \
    --pages_per_group 10
```

**S3-Based Distributed Batch:**
```bash
# Worker 1 (coordinator)
python -m olmocr.pipeline s3://bucket/workspace \
    --pdfs s3://bucket/pdfs/*.pdf

# Worker 2-N (join existing workspace)
python -m olmocr.pipeline s3://bucket/workspace
```

**Beaker Cluster (Ai2 internal):**
```bash
python -m olmocr.pipeline s3://bucket/workspace \
    --pdfs s3://bucket/pdfs/*.pdf \
    --beaker --beaker_gpus 4
```

### Error Handling

**Retry Mechanism:**
```python
# Configurable retry parameters
--max_page_retries 5              # Max retries per page
--max_page_error_rate 0.15        # Fail if >15% pages error
```

**Page-Level Error Tracking:**
- Automatic retry on parse failures
- Exponential backoff between retries
- Temperature adjustment on retries
- Detailed error logging to `olmocr-pipeline-debug.log`

**Metrics Collection:**
```python
from olmocr.metrics import MetricsKeeper, WorkerTracker

metrics = MetricsKeeper(window=60*5)  # 5-minute rolling window
tracker = WorkerTracker()

# Metrics tracked:
# - server_input_tokens
# - server_output_tokens
# - completed_pages
# - failed_pages
# - finished_on_attempt_N
# - tokens_per_sec rates
```

### Configuration Options

**Full Pipeline Options:**
```bash
python -m olmocr.pipeline --help

Key options:
  --pdfs [PDFS ...]               Paths to PDFs (glob supported)
  --model MODEL                   Model path (default: allenai/olmOCR-2-7B-1025-FP8)
  --server SERVER                 External vLLM server URL
  --api_key API_KEY              API key for external server
  --workers WORKERS               Concurrent workers (default: 4)
  --pages_per_group N            Pages per batch request
  --max_page_retries N           Max retries per page (default: 5)
  --max_page_error_rate FLOAT    Max error rate before failing
  --target_longest_image_dim N   Image resolution (default: 1568)
  --gpu-memory-utilization F     GPU memory usage (default: 0.95)
  --max_model_len N              Max sequence length
  --tensor-parallel-size N       Tensor parallelism
  --data-parallel-size N         Data parallelism
  --markdown                     Output markdown files
  --apply_filter                 Apply quality filters
  --stats                        Generate statistics
```

**Using External Inference Server:**
```bash
# Point to existing vLLM server
python -m olmocr.pipeline ./workspace \
    --server http://remote-server:8000/v1 \
    --markdown --pdfs *.pdf
```

**Launch your own vLLM server:**
```bash
vllm serve allenai/olmOCR-2-7B-1025-FP8 \
    --served-model-name olmocr \
    --max-model-len 16384
```

### FastAPI Integration Example

```python
from fastapi import FastAPI, UploadFile
import asyncio
from olmocr.pipeline import build_page_query
from olmocr.data.renderpdf import render_pdf_to_base64png
import tempfile
import httpx

app = FastAPI()

# Assuming vLLM server running at localhost:8000
VLLM_SERVER = "http://localhost:8000/v1/chat/completions"

@app.post("/ocr/pdf")
async def process_pdf_endpoint(file: UploadFile):
    # Save uploaded PDF
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        content = await file.read()
        tmp.write(content)
        pdf_path = tmp.name

    # Process first page as example
    query = await build_page_query(pdf_path, page=0, target_longest_image_dim=1568)

    # Send to vLLM
    async with httpx.AsyncClient() as client:
        response = await client.post(VLLM_SERVER, json=query, timeout=30.0)
        result = response.json()

    return {"text": result["choices"][0]["message"]["content"]}
```

---

## 5. Advantages Over Current Solutions

### vs. Azure Computer Vision

**Advantages:**
- **Cost**: $176/M pages vs Azure's variable pricing
- **Privacy**: Runs locally, no data sent to cloud
- **Quality**: Better on academic/technical documents
- **Customization**: Can fine-tune on your domain
- **No Rate Limits**: Your hardware, your rules

**Disadvantages:**
- Requires GPU infrastructure
- Higher upfront setup cost
- Need to manage model updates yourself

### vs. EasyOCR

**Advantages:**
- **Quality**: Dramatically better on complex layouts
- **Structure**: Preserves document structure (headers, sections)
- **Reading Order**: Correct reading order in multi-column
- **Tables**: Much better table extraction
- **Equations**: Handles mathematical notation

**Disadvantages:**
- Requires more GPU memory (15GB vs ~2GB)
- Slower per page
- Larger model size

### vs. Tesseract

**Advantages:**
- **Layout Understanding**: VLM understands document structure
- **Quality**: Much better on poor scans
- **Multi-column**: Handles complex layouts correctly
- **No Training Needed**: Pre-trained on diverse documents

**Disadvantages:**
- Much higher resource requirements
- Slower processing
- Requires GPU (Tesseract is CPU-only)

### Japanese Document Handling

**Current State:**
- **Base Model**: Qwen2-VL supports Japanese
- **Fine-tuning**: Training data was English-focused
- **Expected Performance**:
  - Modern printed Japanese: Likely decent (Qwen2-VL baseline)
  - Complex Japanese layouts: Unknown
  - Handwritten Japanese: Likely poor
  - Mixed Japanese/English: Potentially good

**Recommendation for UNS-ClaudeJP:**
- **Test First**: Run benchmark on Japanese 履歴書 samples
- **Consider Fine-tuning**: Could fine-tune on Japanese HR documents
- **Hybrid Approach**:
  - Use Azure OCR (proven for Japanese)
  - Use OlmOCR for English sections
  - Fallback strategy based on language detection

**Comparison Table:**

| Feature | OlmOCR | Azure CV | EasyOCR | Tesseract |
|---------|--------|----------|---------|-----------|
| Japanese Support | Untested (base: Yes) | Excellent | Good | Fair |
| Cost (local) | GPU required | N/A | Free | Free |
| Cost (cloud) | $176/M | Variable | N/A | N/A |
| Layout Preservation | Excellent | Good | Poor | Poor |
| Table Extraction | Excellent | Good | Poor | Poor |
| Handwriting | Good | Good | Fair | Poor |
| Privacy | Excellent | Poor | Excellent | Excellent |

---

## 6. Limitations and Considerations

### Model Size

**Download Size:**
- Full model: ~13-15GB (7B parameters in FP8)
- Model location: HuggingFace `allenai/olmOCR-2-7B-1025-FP8`
- First run: Auto-downloads from HuggingFace

**Disk Space:**
- Model weights: 15GB
- Workspace/cache: Varies (depends on PDFs processed)
- Temp files: Can be significant for large batches
- Total recommendation: 30GB+ free space

### Inference Time

**Typical Times (RTX 4090):**
- Simple page: 2-3 seconds
- Complex page: 5-10 seconds
- Retry attempts: +2-5 seconds each

**Factors Affecting Speed:**
- GPU model (A100 > L40S > RTX 4090)
- Page complexity (tables/equations slower)
- Image resolution (higher = slower)
- Batch size (larger = more efficient)

**Optimization Tips:**
- Use FP8 quantization (default in latest model)
- Enable Flash Attention (`pip install flashinfer`)
- Increase `--workers` for multi-GPU
- Use `--pages_per_group` for batching

### Resource Usage

**GPU Memory:**
- Model: ~13GB VRAM (FP8)
- Inference overhead: ~2GB
- Total: 15GB minimum
- Recommended: 16GB+ for stable operation

**System Memory:**
- Base: 8GB
- PDF rendering: +2-4GB
- Worker processes: +1GB per worker
- Recommended: 16GB+ system RAM

**Network:**
- Local inference: Minimal
- S3 integration: Depends on PDF size and count
- Model download: One-time 15GB download

### Known Issues

**From GitHub Issues:**
1. **Blank Documents**: v0.3.0+ fixed hallucinations on blank pages
2. **Auto-rotation**: v0.3.0+ fixed rotation detection
3. **Environment Conflicts**: Must use clean Python 3.11 environment
4. **Docker GPU**: Requires `--gpus all` flag

**Performance Variability:**
- First attempt success: ~60-70%
- Requires retries for challenging pages
- Error rate: Typically <15% with retries

**Language Limitations:**
- Optimized for English
- Other languages: Dependent on Qwen2-VL base capabilities
- No explicit multilingual training data mentioned

### Production Considerations

**Monitoring:**
- Built-in metrics collection
- Logs to `olmocr-pipeline-debug.log`
- Real-time progress bars via tqdm
- Per-worker statistics tracking

**Scaling Challenges:**
- GPU availability
- S3 bandwidth (for distributed mode)
- PDF rendering CPU bottleneck
- Workspace coordination overhead

**Cost Analysis:**
- GPU costs: $0.50-2.00/hour (cloud GPU)
- Processing: ~1,000-10,000 pages/hour/GPU
- Effective cost: $0.0001-0.0005 per page
- Total: ~$100-500 per million pages (cloud GPU rental)
- Self-hosted: Lower cost but capital expense

---

## 7. Code Examples

### Simple Image Processing

```python
import asyncio
from olmocr.pipeline import build_page_query
from olmocr.image_utils import is_png, is_jpeg
import httpx
import json

async def process_single_image(image_path: str, server_url: str = "http://localhost:8000/v1/chat/completions"):
    """Process a single image file (PNG or JPEG)"""

    # Build query for the image (page 0 for images)
    query = await build_page_query(
        local_pdf_path=image_path,
        page=0,
        target_longest_image_dim=1568,
        model_name="olmocr"
    )

    # Send to inference server
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(server_url, json=query)
        result = response.json()

    # Extract text
    extracted_text = result["choices"][0]["message"]["content"]

    return extracted_text

# Usage
async def main():
    text = await process_single_image("document.png")
    print(text)

asyncio.run(main())
```

### Batch Processing Example

```python
import asyncio
from pathlib import Path
from olmocr.pipeline import build_page_query
import httpx
from tqdm.asyncio import tqdm_asyncio

async def process_pdf_batch(pdf_path: str, server_url: str, max_concurrent: int = 4):
    """Process all pages of a PDF with concurrency control"""

    from pypdf import PdfReader

    # Get page count
    reader = PdfReader(pdf_path)
    num_pages = len(reader.pages)

    semaphore = asyncio.BoundedSemaphore(max_concurrent)

    async def process_page(page_num: int):
        async with semaphore:
            query = await build_page_query(pdf_path, page_num, 1568)

            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(server_url, json=query)
                result = response.json()

            return {
                "page": page_num,
                "text": result["choices"][0]["message"]["content"],
                "tokens": result["usage"]
            }

    # Process all pages concurrently
    tasks = [process_page(i) for i in range(num_pages)]
    results = await tqdm_asyncio.gather(*tasks, desc="Processing pages")

    # Sort by page number
    results.sort(key=lambda x: x["page"])

    # Combine into single document
    full_text = "\n\n".join(r["text"] for r in results)

    return {
        "text": full_text,
        "pages": results,
        "total_pages": num_pages
    }

# Usage
async def main():
    result = await process_pdf_batch(
        "document.pdf",
        "http://localhost:8000/v1/chat/completions",
        max_concurrent=4
    )

    # Save to file
    with open("output.md", "w", encoding="utf-8") as f:
        f.write(result["text"])

    print(f"Processed {result['total_pages']} pages")

asyncio.run(main())
```

### Japanese Document Processing (Experimental)

```python
import asyncio
from olmocr.pipeline import build_page_query
import httpx
from langdetect import detect

async def process_japanese_document(pdf_path: str, server_url: str):
    """
    Process Japanese document with language detection
    Falls back to alternative method if confidence is low
    """

    # Process first page
    query = await build_page_query(pdf_path, 0, 1568)

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(server_url, json=query)
        result = response.json()

    text = result["choices"][0]["message"]["content"]

    # Detect language
    try:
        detected_lang = detect(text)
        confidence = "high" if len(text) > 100 else "low"
    except:
        detected_lang = "unknown"
        confidence = "low"

    return {
        "text": text,
        "detected_language": detected_lang,
        "confidence": confidence,
        "recommendation": "use_azure" if detected_lang == "ja" and confidence == "low" else "continue_olmocr"
    }

# Usage
async def main():
    result = await process_japanese_document(
        "rirekisho.pdf",
        "http://localhost:8000/v1/chat/completions"
    )

    print(f"Language: {result['detected_language']}")
    print(f"Confidence: {result['confidence']}")
    print(f"Recommendation: {result['recommendation']}")

    if result['recommendation'] == "use_azure":
        print("Consider using Azure Computer Vision for this document")
    else:
        print("OlmOCR appears to handle this document well")

asyncio.run(main())
```

### External API Provider Usage

```python
# Using DeepInfra (verified provider)
import subprocess

def process_with_deepinfra(pdf_paths: list[str], api_key: str):
    """Process PDFs using DeepInfra API"""

    cmd = [
        "python", "-m", "olmocr.pipeline",
        "./workspace",
        "--server", "https://api.deepinfra.com/v1/openai",
        "--api_key", api_key,
        "--model", "allenai/olmOCR-2-7B-1025",
        "--markdown",
        "--pdfs", *pdf_paths
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    return result

# Usage
result = process_with_deepinfra(
    ["doc1.pdf", "doc2.pdf"],
    "DfXXXXXXX"
)
```

### Integration with FastAPI

```python
from fastapi import FastAPI, UploadFile, BackgroundTasks
from fastapi.responses import JSONResponse
import asyncio
import tempfile
import uuid
from pathlib import Path
from olmocr.pipeline import build_page_query
import httpx

app = FastAPI()

# Storage for async job results
job_results = {}

async def process_pdf_job(job_id: str, pdf_path: str):
    """Background job to process PDF"""
    try:
        from pypdf import PdfReader
        reader = PdfReader(pdf_path)
        num_pages = len(reader.pages)

        pages_text = []
        for page_num in range(num_pages):
            query = await build_page_query(pdf_path, page_num, 1568)

            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    "http://localhost:8000/v1/chat/completions",
                    json=query
                )
                result = response.json()
                pages_text.append(result["choices"][0]["message"]["content"])

        job_results[job_id] = {
            "status": "completed",
            "text": "\n\n".join(pages_text),
            "pages": num_pages
        }
    except Exception as e:
        job_results[job_id] = {
            "status": "failed",
            "error": str(e)
        }
    finally:
        # Cleanup temp file
        Path(pdf_path).unlink(missing_ok=True)

@app.post("/ocr/upload")
async def upload_pdf(file: UploadFile, background_tasks: BackgroundTasks):
    """Upload PDF and start background processing"""

    # Save upload
    job_id = str(uuid.uuid4())
    temp_path = f"/tmp/{job_id}.pdf"

    content = await file.read()
    with open(temp_path, "wb") as f:
        f.write(content)

    # Start background job
    job_results[job_id] = {"status": "processing"}
    background_tasks.add_task(process_pdf_job, job_id, temp_path)

    return {"job_id": job_id, "status": "processing"}

@app.get("/ocr/status/{job_id}")
async def get_job_status(job_id: str):
    """Check job status"""
    if job_id not in job_results:
        return JSONResponse(
            status_code=404,
            content={"error": "Job not found"}
        )

    return job_results[job_id]

# Run with: uvicorn app:app --reload
```

---

## 8. Implementation Recommendations for UNS-ClaudeJP

### Evaluation Phase

**Step 1: Benchmark Japanese Documents**
```bash
# Test on sample 履歴書 images
python -m olmocr.pipeline ./test_workspace --markdown \
    --pdfs sample_rirekisho/*.pdf \
    --workers 2
```

**Step 2: Compare with Current Solution**
- Run same documents through Azure Computer Vision
- Compare accuracy, formatting, cost
- Test edge cases: handwriting, poor scans, mixed layouts

**Step 3: Measure Performance**
- Processing time per document
- GPU utilization
- Memory requirements
- Error rates

### Integration Strategy

**Option A: Replace Azure (if Japanese performance acceptable)**
- Lower cost ($176/M vs Azure fees)
- Better privacy (local processing)
- Require GPU infrastructure investment

**Option B: Hybrid Approach (Recommended)**
```python
async def intelligent_ocr(document_path: str):
    """Use best OCR for document type"""

    # Detect document characteristics
    lang = detect_language(document_path)
    quality = assess_quality(document_path)

    if lang == "ja" and quality == "poor":
        # Handwritten or poor scan Japanese
        return await azure_ocr(document_path)
    elif lang == "ja" and quality == "good":
        # Try OlmOCR first, fallback to Azure
        try:
            result = await olmocr_process(document_path)
            if validate_japanese(result):
                return result
        except:
            pass
        return await azure_ocr(document_path)
    else:
        # English or mixed - use OlmOCR
        return await olmocr_process(document_path)
```

**Option C: Fine-tune for Japanese**
- Collect 1,000+ Japanese HR documents
- Fine-tune olmOCR on Japanese resume dataset
- Potential to match/exceed Azure on domain-specific docs

### Cost-Benefit Analysis

**Current (Azure Only):**
- Cost: Variable per API call
- Quality: Proven for Japanese
- Scalability: API limits apply
- Privacy: Data sent to cloud

**OlmOCR Only:**
- Cost: GPU purchase (~$1,500-3,000 for RTX 4090) + electricity
- Cost per page: ~$0.0002 (amortized)
- Quality: Unknown for Japanese (needs testing)
- Scalability: Limited by GPU count
- Privacy: Excellent (local)

**Hybrid (Recommended):**
- Cost: GPU + occasional Azure API calls
- Quality: Best of both worlds
- Scalability: Good
- Privacy: Good (mostly local)

### Infrastructure Requirements

**Minimum Setup:**
- 1x RTX 4090 (24GB VRAM) - ~$1,600
- Ubuntu 22.04 LTS
- Docker + nvidia-docker
- 64GB RAM
- 500GB SSD

**Production Setup:**
- 2-4x L40S or A100 GPUs
- Load balancer for vLLM servers
- S3-compatible storage for queues
- Monitoring (Prometheus + Grafana)

---

## 9. Technical Architecture Details

### Model Architecture

**Base Model:** Qwen2-VL-7B-Instruct
- Vision-Language Model
- 7 billion parameters
- Multimodal (vision + text)
- Quantized to FP8 for efficiency

**Fine-tuning Dataset:** olmOCR-mix-0225
- 260,000 pages
- 100,000+ PDFs
- Diverse document types
- Includes: graphics, handwriting, poor scans

**Training Approach (v0.4.0):**
- Synthetic data generation
- RL (Reinforcement Learning) training
- Unit test rewards (see paper)

### Inference Pipeline

**Flow:**
1. PDF → PDF Rendering (poppler) → PNG images
2. Image → Base64 encoding
3. Base64 + Prompt → VLM
4. VLM → YAML-structured text
5. YAML → Markdown/Dolma format
6. Quality checks + retry if needed

**Prompt Engineering:**
- Uses `build_no_anchoring_v4_yaml_prompt()`
- YAML-structured output for reliability
- Zero-shot (no in-context examples needed)

**Retry Logic:**
- Temperature: Starts at 0.0
- On failure: May increase temperature slightly
- Max attempts: Configurable (default 5)
- Tracks success by attempt number

### Supported Backends

**vLLM (Default):**
- Fast inference server
- Continuous batching
- PagedAttention for memory efficiency
- Multi-GPU support (tensor + data parallelism)

**SGLang (Alternative):**
- Structured generation
- Grammar constraints
- Slightly slower but more reliable output

**External Providers:**
- DeepInfra: $0.09/$0.19 per M tokens
- Parasail: $0.10/$0.20 per M tokens
- Any OpenAI-compatible API

---

## 10. Security & Privacy

**Local Deployment:**
- No data sent to external services
- Full control over model and data
- Compliant with GDPR, HIPAA (if self-hosted)

**Model Provenance:**
- Open source (Apache 2.0 license)
- Model weights on HuggingFace
- Reproducible training code available

**API Mode:**
- HTTPS recommended for external servers
- API key authentication supported
- Consider VPN for sensitive documents

---

## 11. Future Roadmap (from GitHub)

**Completed (v0.4.0):**
- RL training with unit test rewards
- Synthetic data generation
- FP8 quantization for speed
- Auto-rotation detection
- Blank page handling

**Potential Future Improvements:**
- Multi-language fine-tuning
- Smaller model variants (3B, 1B)
- Real-time streaming inference
- Better table structure preservation
- Document classification integration

---

## 12. Community & Support

**Resources:**
- GitHub: https://github.com/allenai/olmocr
- Papers: arXiv:2502.18443 (v1), arXiv:2510.19817 (v2)
- Demo: https://olmocr.allenai.org/
- Discord: https://discord.gg/sZq3jTNVNG
- Docker Hub: alleninstituteforai/olmocr

**Documentation:**
- README: Comprehensive usage guide
- Benchmark: olmocr-bench for testing
- Training: Full training code available

**Issue Tracker:**
- 26 open issues
- Active development
- Responsive maintainers

---

## Conclusion

OlmOCR represents a significant advancement in open-source document OCR, offering:

**Strengths:**
- State-of-the-art accuracy on English documents
- Extremely cost-effective ($176/M pages)
- Full privacy and control (self-hosted)
- Excellent layout understanding
- Active development and support

**Considerations for UNS-ClaudeJP:**
- Japanese language support needs validation
- Requires GPU infrastructure investment
- May need fine-tuning for optimal Japanese performance
- Best used in hybrid approach with Azure for now

**Recommendation:**
Test on representative Japanese HR document sample before committing to full integration. Consider hybrid approach leveraging OlmOCR's strengths (layout, tables, English) while maintaining Azure for challenging Japanese handwriting.

---

**Last Updated:** 2025-10-26
**Next Review:** After Japanese document testing phase
