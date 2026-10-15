<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\HeroSlide;
use App\Models\ProductionSlide;
use App\Models\Service;
use App\Models\SitePage;
use App\Models\Vacancy;
use App\Support\ContentImage;
use Illuminate\Http\JsonResponse;

/** Всё, что редактор правит в панели, — одним ответом для витрины. */
class ContentController extends Controller
{
    public function index(): JsonResponse
    {
        $lines = fn (?string $text): array => array_values(array_filter(array_map('trim', preg_split('/\R/u', (string) $text))));

        $services = Service::query()->where('is_active', true)->orderBy('sort')->orderBy('id')->get()
            ->map(fn (Service $s): array => [
                'slug' => $s->slug,
                'name' => $s->name,
                'note' => $s->note,
                'icon' => $s->icon,
                'cardPhoto' => ContentImage::url($s->card_photo),
                'heroPhoto' => ContentImage::url($s->hero_photo),
                'heroAlt' => (string) $s->hero_alt,
                'processPhoto' => ContentImage::url($s->process_photo),
                'processName' => (string) $s->process_name,
                'processNote' => (string) $s->process_note,
                'title' => $s->title,
                'lead' => $s->lead,
                'price' => filled($s->price) ? $s->price : null,
                'priceNote' => (string) $s->price_note,
                'risk' => ['title' => $s->risk_title, 'punch' => (string) $s->risk_punch, 'items' => array_values($s->risk_items ?? [])],
                'factors' => array_values($s->factors ?? []),
                'steps' => array_values($s->steps ?? []),
                'result' => (string) $s->result,
                'prices' => array_values($s->prices ?? []),
                'priceText' => (string) $s->price_text,
                'cta' => $s->cta,
                'form' => $s->form,
                'seoTitle' => $s->seo_title ?: $s->title,
                'seoDescription' => $s->seo_description ?: $s->lead,
            ]);

        $heroSlides = HeroSlide::query()->where('is_active', true)->orderBy('sort')->orderBy('id')->get()
            ->map(fn (HeroSlide $h): array => [
                'key' => (string) $h->id,
                'label' => $h->label,
                'title' => $lines($h->title),
                'accent' => $lines($h->accent),
                'note' => (string) $h->note,
                'photo' => ContentImage::url($h->photo),
                'photoMobile' => ContentImage::url($h->photo_mobile) ?? ContentImage::url($h->photo),
                'alt' => (string) $h->alt,
                'href' => (string) $h->href,
            ]);

        $production = ProductionSlide::query()->where('is_active', true)->orderBy('sort')->orderBy('id')->get()
            ->map(fn (ProductionSlide $p): array => [
                'key' => (string) $p->id,
                'name' => $p->name,
                'note' => (string) $p->note,
                'photo' => ContentImage::url($p->photo),
            ]);

        $vacancies = Vacancy::query()->where('is_active', true)->orderBy('sort')->orderBy('id')->get()
            ->map(fn (Vacancy $v): array => [
                'key' => (string) $v->id,
                'title' => $v->title,
                'summary' => $v->summary,
                'photo' => ContentImage::url($v->photo),
                'focus' => $v->focus,
                'duties' => array_values($v->duties ?? []),
                'requirements' => array_values($v->requirements ?? []),
            ]);

        return response()
            ->json(['data' => [
                'services' => $services,
                'heroSlides' => $heroSlides,
                'production' => $production,
                'vacancies' => $vacancies,
                'dealerPage' => (object) ContentImage::urlsIn(SitePage::contentOf(SitePage::DEALERS)),
                'vacanciesPage' => (object) ContentImage::urlsIn(SitePage::contentOf(SitePage::VACANCIES)),
            ]])
            ->header('Cache-Control', 'public, max-age=60');
    }
}
