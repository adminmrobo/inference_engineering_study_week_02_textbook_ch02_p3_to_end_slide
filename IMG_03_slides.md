# 3주차 발표 「병목을 찾아라」 이미지 제작 명세서

| 항목 | 내용 |
|---|---|
| 대상 | `index.html` (인퍼런스러닝 3주차 발표 슬라이드, 『Inference Engineering』 2.3–2.5, 본편 34장 + 부록 17장) |
| 발표 주제 비유 | **AI 공장**: 예전에는 따로 떨어진 공방, 지금은 하나로 이어진 생산 라인 → 속도·품질·비용(전력)의 균형과 병목 찾기 |
| 해설 페이지와 다른 점 | 해설 페이지(주방 비유, cover_03)와 그림을 공유하지 않음. 슬라이드는 **공장 라인**이 주제 |
| 새로 그릴 그림 | P1 1장 (`s03_cover`) · P2 1장 (`og_s03`, 표지 자르기 가능) · P3 1장 (`thumb_s03`, 표지 자르기) |
| 이미 들어 있는 그림 | 캐릭터 표정(박사·조수·초파리·주판봇), 도입 슬라이드의 동작 시리즈 그림 5장(m1–m5), 사례 슬라이드의 서버·GPU 사진 — 다시 그리지 않음 |
| 그림이 없을 때 | 슬라이드는 지금 그대로 완성 상태. 그림은 표지 분위기와 공유 미리보기를 위한 보강 |

## 1. 그림체와 고정 외형
- 스타일: 연구실 시리즈와 같은 16비트 RPG 픽셀아트, 굵은 외곽선, 2–3단계 명암, 밤의 연구실 보라빛 조명, 자홍·초록 형광 포인트
- 슬라이드 배경색과 맞추기: 아주 어두운 남보라(#0E0F18 근처)에서 시작해 오른쪽으로 갈수록 밝아짐
- **표지 그림에는 캐릭터를 넣지 않음.** 표지 슬라이드 오른쪽에 네 캐릭터의 역할 카드가 이미 올라가므로, 그림에 캐릭터가 있으면 겹침
- 글자·숫자·로고 금지 (계기판 눈금에도 숫자 없이)

## 2. 필요한 그림 전체

| # | 키 | 크기 | 상태 | 우선 | 들어가는 곳 | 페이지 반영 |
|---|---|---|---|---|---|---|
| 0 | `s03_cover` | 1920×1080 | 새로 | P1 | 1번 슬라이드(표지) 배경 | `images/s03_cover.webp`로 올리면 **자동** (왼쪽은 어둡게 덮어 제목을 살림) |
| 1 | `og_s03` | 1200×630 | 표지 자르기 + 제목 얹기 | P2 | 링크 공유 미리보기 | `images/og_s03.webp`로 올리면 **자동** (`og:image`가 이 경로를 가리킴) |
| 2 | `thumb_s03` | 600×400 | 표지 3:2 자르기 | P3 | 현황 사이트·목차 카드 | 페이지에는 쓰지 않음 |

## 3. `s03_cover` — 병목 하나에 멈춘 AI 공장 라인

| 항목 | 내용 |
|---|---|
| 판 · 크기 | 16:9 · 1920×1080 이상 |
| 장면 | 밤의 연구실과 이어진 작은 공장. 오른쪽 위에서 가운데로 내려오는 컨베이어 라인에 작업대 다섯 곳(동작 알아보기 → 만들기 → 접고 펴기 → 말과 짝 → 영상으로)이 차례로 있음. 그중 **세 번째 작업대 앞에만 빛나는 상자가 잔뜩 쌓여 막혀 있고**, 그 뒤 작업대들은 텅 비어 기다림. 라인 끝에는 꺼진 작은 화면(완성 영상 자리) |
| 세 계기판 | 오른쪽 위 벽에 둥근 계기판 셋: 속도(바늘이 낮음), 품질(초록, 중간), 전력(빨강, 높음). 눈금 숫자 없음 |
| 구도 | **왼쪽 45%는 어둡고 단순하게** (제목 자리). 가운데 오른쪽 중간 높이(가로 55–95%, 세로 38–72%)는 **흐리고 차분하게** — 역할 카드 네 장이 올라감. 밝은 초점은 오른쪽 위 계기판과 막힌 작업대 |
| 피할 것 | 캐릭터, 사람, 글자·숫자, 실제 회사 로고, 실제 GPU 제품 모양 |
| 대체 글 (alt) | 다섯 작업대가 이어진 밤의 AI 공장 라인에서 세 번째 작업대 앞에만 상자가 쌓여 라인이 멈춘 장면 |

**Genspark에 붙여 넣기 ↓**
```
발표 슬라이드 표지의 배경 그림 1장을 만들어 줘.
- 비율 16:9, 가로 1920px 이상
- 사람·캐릭터는 넣지 말 것 (슬라이드 위에 캐릭터 카드가 따로 올라감)
- 그림 안에 글자·숫자·로고를 넣지 말 것 (계기판 눈금에도 숫자 없이)
- 왼쪽 45%는 아주 어둡고 단순하게 (제목이 올라감)
- 가운데 오른쪽 중간 높이는 흐리고 차분하게 (카드가 올라감)
아래 영어 프롬프트를 그대로 써 줘.

Presentation title slide background, wide 16:9, no characters, no people.
16-bit RPG style pixel art, bold dark outline, 2–3 tone shading, small highlights.
Cozy night laboratory mood, deep navy-purple darkness, soft magenta and green fluorescent accents.
Scene: a small factory hall built into the same night lab world. A long glowing conveyor line runs from the upper right toward the center, passing five small workstations in a row, each with a tiny machine and a soft lamp. In front of the third workstation, many small glowing amber boxes are piled up and jammed on the belt; the fourth and fifth workstations after it are empty and idle with dim lamps. At the very end of the line, a small dark screen that is switched off.
On the upper right wall, three round analog gauges side by side: one with a needle pointing low, one glowing green with a needle in the middle, one glowing red with a needle near the top. No numbers, no tick labels.
Composition: the left 45 percent of the image is very dark and nearly empty, a smooth gradient into deep navy; the middle-right band at mid height stays soft, dim and low in detail; the brightest points are the jammed boxes at the third workstation and the three gauges in the upper right.
Mood: calm, curious, a factory waiting for one slow station — the bottleneck.
No text, no letters, no numbers, no logos, no characters, no people, no real brands, no weapons, no blood.
```

**고칠 때 (같은 대화에서):** `Same scene, same art style and composition. Change only: {고칠 점}. Still no text, no characters.`

## 4. `og_s03` — 공유 미리보기
1. `s03_cover`에서 1200×630(1.91:1) 영역을 자릅니다. 막힌 작업대와 계기판이 들어가게 오른쪽으로 치우쳐 자릅니다.
2. 왼쪽 어두운 부분에 제목을 직접 얹습니다 (그림 생성기에 글자를 맡기지 않음).
   - 큰 글자: **병목을 찾아라**
   - 작은 글자: 인퍼런스러닝 3주차 발표 · 『Inference Engineering』 2.3–2.5
   - 글꼴은 IBM Plex Sans KR 굵게, 흰색. 슬라이드와 같은 초록(#5EE39C)으로 "3주차"만 강조해도 좋음
3. WebP로 저장해 `images/og_s03.webp`로 올립니다 (150 KB 이하).

## 5. `thumb_s03`
`s03_cover`에서 3:2로 잘라 600×400 WebP로 만듭니다. 막힌 작업대가 가운데 오도록 자릅니다. 글자는 넣지 않습니다.

## 6. 넘겨받은 뒤 처리
1. 캐릭터·사람·글자·숫자가 없는지, 왼쪽 45%가 충분히 어두운지 확인
2. WebP로 변환: 표지 1920×1080, 300 KB 이하
3. `images/s03_cover.webp`로 올린 뒤 슬라이드 1번에서 제목·역할 카드가 잘 읽히는지 확인 (1280×720 화면과 휴대폰 가로 화면)
4. 카드 뒤가 너무 복잡하면 같은 대화에서 "middle-right band darker and simpler"로 고쳐 다시 받기

## 7. 체크리스트
- [ ] 표지에 캐릭터·사람 없음 (역할 카드와 겹치지 않게)
- [ ] 글자·숫자·로고 없음 (og 제목은 나중에 직접 얹음)
- [ ] 왼쪽 45% 어둡고 단순함
- [ ] 막힌 작업대가 하나뿐 (병목 하나)
- [ ] 계기판 셋: 속도 낮음 · 품질 중간 · 전력 높음
- [ ] 해설 페이지 표지(주방)와 다른 장면 (공장 라인)
