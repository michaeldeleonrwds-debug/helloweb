<?php

namespace App\Http\Requests\Builder;

use App\Models\Page;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;
use JsonException;

class SaveBuilderDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        $page = $this->route('page');

        return $page instanceof Page && $this->user()?->can('update', $page) === true;
    }

    public function rules(): array
    {
        return [
            'document' => ['required', 'array'],
            'expected_version' => ['required', 'integer', 'min:0'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            try {
                $size = strlen(json_encode($this->input('document'), JSON_THROW_ON_ERROR));
            } catch (JsonException) {
                $validator->errors()->add('document', 'The document must be valid JSON data.');

                return;
            }

            if ($size > 1_000_000) {
                $validator->errors()->add('document', 'The document is too large.');
            }
        });
    }
}
