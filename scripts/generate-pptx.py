#!/usr/bin/env python3
"""Generate rare2ai introduction PowerPoint presentation."""

import os
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
LOGO_PATH = os.path.join(PROJECT_DIR, "public", "logo-full.png")
OUTPUT_PATH = os.path.join(PROJECT_DIR, "rare2ai-introduction.pptx")

# Colors
BG_COLOR = RGBColor(0x12, 0x12, 0x1A)
AMBER = RGBColor(0xE8, 0xA0, 0x38)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
GRAY = RGBColor(0x9C, 0xA3, 0xAF)
DARK_CARD = RGBColor(0x1E, 0x1E, 0x2E)
AMBER_DIM = RGBColor(0xE8, 0xA0, 0x38)


def set_slide_bg(slide, color=BG_COLOR):
    bg = slide.background
    fill = bg.fill
    fill.solid()
    fill.fore_color.rgb = color


def add_shape_bg(slide, left, top, width, height, color=DARK_CARD, radius=None):
    shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    shape.fill.solid()
    shape.fill.fore_color.rgb = color
    shape.line.fill.background()
    shape.shadow.inherit = False
    return shape


def add_text_box(slide, left, top, width, height, text, font_size=18, color=WHITE,
                 bold=False, alignment=PP_ALIGN.LEFT, font_name="Microsoft YaHei"):
    txBox = slide.shapes.add_textbox(left, top, width, height)
    tf = txBox.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = text
    p.font.size = Pt(font_size)
    p.font.color.rgb = color
    p.font.bold = bold
    p.font.name = font_name
    p.alignment = alignment
    return txBox


def add_bullet_list(slide, left, top, width, height, items, font_size=16, color=WHITE):
    txBox = slide.shapes.add_textbox(left, top, width, height)
    tf = txBox.text_frame
    tf.word_wrap = True
    for i, item in enumerate(items):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = item
        p.font.size = Pt(font_size)
        p.font.color.rgb = color
        p.font.name = "Microsoft YaHei"
        p.space_after = Pt(8)
        p.level = 0
    return txBox


def add_subtitle(slide, left, top, width, text, font_size=14):
    add_text_box(slide, left, top, width, Inches(0.4), text, font_size=font_size, color=GRAY)


def slide_title(slide, chinese, english, y_start=Inches(0.6)):
    add_text_box(slide, Inches(0.8), y_start, Inches(8), Inches(0.6),
                 chinese, font_size=32, color=AMBER, bold=True)
    add_text_box(slide, Inches(0.8), y_start + Inches(0.55), Inches(8), Inches(0.4),
                 english, font_size=16, color=GRAY, bold=False)


def make_cover(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])  # blank
    set_slide_bg(slide)

    # Logo
    if os.path.exists(LOGO_PATH):
        slide.shapes.add_picture(LOGO_PATH, Inches(4.1), Inches(0.8), Inches(1.8), Inches(1.8))

    # Title
    add_text_box(slide, Inches(0.5), Inches(3.0), Inches(9), Inches(0.8),
                 "罕见病联盟 rare2ai", font_size=40, color=WHITE, bold=True,
                 alignment=PP_ALIGN.CENTER)

    # Subtitle
    add_text_box(slide, Inches(0.5), Inches(3.8), Inches(9), Inches(0.6),
                 "Rare Disease Community Alliance", font_size=20, color=AMBER,
                 alignment=PP_ALIGN.CENTER)

    # Tagline
    add_text_box(slide, Inches(1), Inches(4.6), Inches(8), Inches(0.5),
                 "AI驱动的罕见病患者社区与知识平台", font_size=16, color=GRAY,
                 alignment=PP_ALIGN.CENTER)

    # Bottom line
    add_text_box(slide, Inches(1), Inches(6.5), Inches(8), Inches(0.4),
                 "Share your story. Support each other.", font_size=14, color=GRAY,
                 alignment=PP_ALIGN.CENTER)


def make_vision(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_bg(slide)
    slide_title(slide, "平台愿景", "Our Vision & Mission")

    items = [
        "为罕见病患者和家庭构建温暖的在线社区",
        "整合罕见病知识库，降低信息获取门槛",
        "借助AI技术，提供智能化的疾病信息检索与匹配",
        "连接患者、医生、研究者和公益组织",
        "推动罕见病领域的数据开放与协作",
    ]
    icons = ["🏠", "📚", "🤖", "🔗", "📊"]
    for i, (icon, item) in enumerate(zip(icons, items)):
        y = Inches(1.8) + Inches(i * 0.75)
        add_shape_bg(slide, Inches(0.8), y, Inches(8.4), Inches(0.6))
        add_text_box(slide, Inches(1.0), y + Inches(0.08), Inches(8), Inches(0.45),
                     f"{icon}  {item}", font_size=17, color=WHITE)


def make_features(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_bg(slide)
    slide_title(slide, "核心功能", "Core Features")

    features = [
        ("社区论坛", "患者交流、经验分享、互助问答"),
        ("疾病目录", "罕见病分类浏览与详情查询"),
        ("新闻资讯", "最新研究进展与政策动态"),
        ("实时通知", "SSE推送，评论/点赞/系统消息"),
        ("Markdown", "富文本发帖，代码高亮，GFM支持"),
        ("数据分析", "API调用统计，用户行为洞察"),
    ]

    for i, (title, desc) in enumerate(features):
        col = i % 2
        row = i // 2
        x = Inches(0.8) + Inches(col * 4.5)
        y = Inches(1.8) + Inches(row * 1.2)
        add_shape_bg(slide, x, y, Inches(4.0), Inches(1.0))
        add_text_box(slide, x + Inches(0.3), y + Inches(0.12), Inches(3.5), Inches(0.35),
                     title, font_size=20, color=AMBER, bold=True)
        add_text_box(slide, x + Inches(0.3), y + Inches(0.5), Inches(3.5), Inches(0.4),
                     desc, font_size=14, color=GRAY)


def make_tech(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_bg(slide)
    slide_title(slide, "技术架构", "Technology Stack")

    stack = [
        ("前端框架", "Next.js 14 (App Router) + React 18"),
        ("样式方案", "Tailwind CSS 4 + 暗色主题"),
        ("数据库", "SQLite (better-sqlite3) WAL模式"),
        ("实时推送", "Server-Sent Events (SSE)"),
        ("认证", "JWT Token + API Key 双模式"),
        ("部署", "Node.js 自托管，轻量级架构"),
    ]

    for i, (label, value) in enumerate(stack):
        col = i % 2
        row = i // 2
        x = Inches(0.8) + Inches(col * 4.5)
        y = Inches(1.8) + Inches(row * 1.2)
        add_shape_bg(slide, x, y, Inches(4.0), Inches(1.0))
        add_text_box(slide, x + Inches(0.3), y + Inches(0.12), Inches(3.5), Inches(0.35),
                     label, font_size=18, color=AMBER, bold=True)
        add_text_box(slide, x + Inches(0.3), y + Inches(0.5), Inches(3.5), Inches(0.4),
                     value, font_size=14, color=WHITE)


def make_mcp(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_bg(slide)
    slide_title(slide, "AI集成 — MCP协议", "AI Integration — Model Context Protocol")

    add_text_box(slide, Inches(0.8), Inches(1.8), Inches(8.4), Inches(0.5),
                 "通过MCP协议，AI助手可以直接操作平台数据，实现智能化服务：",
                 font_size=16, color=WHITE)

    tools = [
        "search_posts — 搜索社区帖子",
        "create_post — 发布新帖子",
        "get_disease_info — 查询疾病信息",
        "search_news — 搜索新闻资讯",
        "get_notifications — 获取用户通知",
        "get_api_analytics — 获取API调用分析",
        "manage_users — 用户管理",
    ]

    add_text_box(slide, Inches(0.8), Inches(2.5), Inches(8.4), Inches(0.4),
                 f"已集成 14+ MCP工具，覆盖平台全部核心功能：",
                 font_size=15, color=AMBER)

    for i, tool in enumerate(tools):
        col = i % 2
        row = i // 2
        x = Inches(1.0) + Inches(col * 4.3)
        y = Inches(3.1) + Inches(row * 0.55)
        add_text_box(slide, x, y, Inches(4.0), Inches(0.45),
                     f"  {tool}", font_size=13, color=GRAY)


def make_api(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_bg(slide)
    slide_title(slide, "API体系", "RESTful API System")

    endpoints = [
        ("帖子 /api/posts", "CRUD、搜索、排序、分页、点赞"),
        ("疾病 /api/diseases", "疾病目录查询与详情"),
        ("新闻 /api/news", "新闻列表与详情"),
        ("用户 /api/users", "注册、登录、个人信息"),
        ("通知 /api/notifications", "消息通知与已读管理"),
        ("分析 /api/analytics", "API调用统计与趋势"),
    ]

    for i, (ep, desc) in enumerate(endpoints):
        y = Inches(1.8) + Inches(i * 0.72)
        add_shape_bg(slide, Inches(0.8), y, Inches(8.4), Inches(0.6))
        add_text_box(slide, Inches(1.0), y + Inches(0.08), Inches(3.5), Inches(0.45),
                     ep, font_size=15, color=AMBER, bold=True)
        add_text_box(slide, Inches(4.8), y + Inches(0.08), Inches(4.2), Inches(0.45),
                     desc, font_size=14, color=GRAY)


def make_stats(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_bg(slide)
    slide_title(slide, "数据概览", "Platform Statistics")

    stats = [
        ("9", "数据表"),
        ("16+", "API端点"),
        ("14+", "MCP工具"),
        ("5", "核心模块"),
    ]

    for i, (num, label) in enumerate(stats):
        x = Inches(0.8) + Inches(i * 2.2)
        y = Inches(2.0)
        add_shape_bg(slide, x, y, Inches(1.9), Inches(1.5))
        add_text_box(slide, x, y + Inches(0.2), Inches(1.9), Inches(0.6),
                     num, font_size=36, color=AMBER, bold=True, alignment=PP_ALIGN.CENTER)
        add_text_box(slide, x, y + Inches(0.85), Inches(1.9), Inches(0.4),
                     label, font_size=15, color=GRAY, alignment=PP_ALIGN.CENTER)

    highlights = [
        "SQLite WAL模式，高并发读取性能",
        "API日志缓冲批量写入，90天自动清理",
        "纯CSS图表，零外部依赖",
        "JWT + API Key双认证模式",
    ]

    for i, h in enumerate(highlights):
        y = Inches(4.0) + Inches(i * 0.55)
        add_text_box(slide, Inches(1.2), y, Inches(7.5), Inches(0.45),
                     f"  {h}", font_size=15, color=WHITE)


def make_audience(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_bg(slide)
    slide_title(slide, "目标用户", "Target Audience")

    audiences = [
        ("罕见病患者及家庭", "获取疾病信息、分享经验、寻求支持"),
        ("医疗研究人员", "查阅病例数据、发布研究成果"),
        ("开发者与AI研究者", "通过MCP/API集成，构建创新应用"),
        ("公益组织", "连接患者群体、推广救助项目"),
    ]

    for i, (title, desc) in enumerate(audiences):
        y = Inches(1.8) + Inches(i * 1.15)
        add_shape_bg(slide, Inches(0.8), y, Inches(8.4), Inches(0.95))
        add_text_box(slide, Inches(1.2), y + Inches(0.1), Inches(7.5), Inches(0.4),
                     title, font_size=20, color=AMBER, bold=True)
        add_text_box(slide, Inches(1.2), y + Inches(0.5), Inches(7.5), Inches(0.4),
                     desc, font_size=15, color=GRAY)


def make_closing(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_bg(slide)

    if os.path.exists(LOGO_PATH):
        slide.shapes.add_picture(LOGO_PATH, Inches(4.1), Inches(1.0), Inches(1.8), Inches(1.8))

    add_text_box(slide, Inches(0.5), Inches(3.2), Inches(9), Inches(0.7),
                 "感谢关注", font_size=36, color=WHITE, bold=True,
                 alignment=PP_ALIGN.CENTER)

    add_text_box(slide, Inches(0.5), Inches(3.9), Inches(9), Inches(0.5),
                 "Thank You", font_size=24, color=AMBER,
                 alignment=PP_ALIGN.CENTER)

    add_text_box(slide, Inches(1), Inches(5.0), Inches(8), Inches(0.4),
                 "让每一个罕见病患者都不再孤单", font_size=16, color=GRAY,
                 alignment=PP_ALIGN.CENTER)

    add_text_box(slide, Inches(1), Inches(5.5), Inches(8), Inches(0.4),
                 "No one is alone in the fight against rare diseases.", font_size=14, color=GRAY,
                 alignment=PP_ALIGN.CENTER)

    add_text_box(slide, Inches(1), Inches(6.3), Inches(8), Inches(0.4),
                 "rare2ai  |  罕见病联盟", font_size=14, color=AMBER_DIM,
                 alignment=PP_ALIGN.CENTER)


def main():
    prs = Presentation()
    prs.slide_width = Inches(10)
    prs.slide_height = Inches(7.5)

    make_cover(prs)
    make_vision(prs)
    make_features(prs)
    make_tech(prs)
    make_mcp(prs)
    make_api(prs)
    make_stats(prs)
    make_audience(prs)
    make_closing(prs)

    prs.save(OUTPUT_PATH)
    print(f"Presentation saved to: {OUTPUT_PATH}")
    print(f"Total slides: {len(prs.slides)}")


if __name__ == "__main__":
    main()
