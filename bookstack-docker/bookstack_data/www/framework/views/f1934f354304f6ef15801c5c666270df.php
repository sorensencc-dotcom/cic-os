
<table class="no-style form-table mb-xs">
    <tr>
        <td width="200"><?php echo e(trans('entities.search_' . $name)); ?></td>
        <td width="80"></td>
    </tr>
    <tr component="optional-input">
        <td>
            <button type="button" refs="optional-input@show"
                    class="text-button <?php echo e(($filters[$name] ?? false) ? 'hidden' : ''); ?>"><?php echo e(trans('entities.search_set_date')); ?></button>
            <input class="tag-input <?php echo e(($filters[$name] ?? false) ? '' : 'hidden'); ?>"
                   refs="optional-input@input"
                   value="<?php echo e($filters[$name] ?? ''); ?>"
                   type="date"
                   name="filters[<?php echo e($name); ?>]"
                   pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}">
        </td>
        <td>
            <button type="button"
                    refs="optional-input@remove"
                    class="text-neg text-button <?php echo e(($filters[$name] ?? false) ? '' : 'hidden'); ?>">
                <?php echo (new \BookStack\Util\SvgIcon('close'))->toHtml(); ?>
            </button>
        </td>
    </tr>
</table><?php /**PATH /app/www/resources/views/search/parts/date-filter.blade.php ENDPATH**/ ?>