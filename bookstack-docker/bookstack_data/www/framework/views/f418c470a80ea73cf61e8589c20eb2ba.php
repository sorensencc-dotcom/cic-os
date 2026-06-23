
<p class="small"><?php echo e(trans('settings.ui_colors_desc')); ?></p>
<div class="grid half pt-m">
    <div>
        <?php echo $__themeViews->handleViewInclude('settings.parts.setting-color-picker', ['type' => 'app', 'mode' => $mode], array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1])); ?>
    </div>
    <div>
        <?php echo $__themeViews->handleViewInclude('settings.parts.setting-color-picker', ['type' => 'link', 'mode' => $mode], array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1])); ?>
    </div>
</div>
<hr>
<p class="small"><?php echo trans('settings.content_colors_desc'); ?></p>
<div class="grid half pt-m">
    <div>
        <?php echo $__themeViews->handleViewInclude('settings.parts.setting-color-picker', ['type' => 'bookshelf', 'mode' => $mode], array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1])); ?>
        <?php echo $__themeViews->handleViewInclude('settings.parts.setting-color-picker', ['type' => 'book', 'mode' => $mode], array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1])); ?>
        <?php echo $__themeViews->handleViewInclude('settings.parts.setting-color-picker', ['type' => 'chapter', 'mode' => $mode], array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1])); ?>
    </div>
    <div>
        <?php echo $__themeViews->handleViewInclude('settings.parts.setting-color-picker', ['type' => 'page', 'mode' => $mode], array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1])); ?>
        <?php echo $__themeViews->handleViewInclude('settings.parts.setting-color-picker', ['type' => 'page-draft', 'mode' => $mode], array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1])); ?>
    </div>
</div>

<input type="hidden"
       value="<?php echo e(setting('app-color-light' . ($mode === 'dark' ? '-dark' : ''))); ?>"
       name="setting-app-color-light<?php echo e($mode === 'dark' ? '-dark' : ''); ?>"><?php /**PATH /app/www/resources/views/settings/parts/setting-color-scheme.blade.php ENDPATH**/ ?>