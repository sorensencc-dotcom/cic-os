<div id="new" class="mb-xl">
    <h5><?php echo e(trans('entities.books_new')); ?></h5>
    <?php if(count($new) > 0): ?>
        <?php echo $__themeViews->handleViewInclude('entities.list', ['entities' => $new, 'style' => 'compact'], array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1])); ?>
    <?php else: ?>
        <p class="text-muted pb-l mb-none"><?php echo e(trans('entities.books_new_empty')); ?></p>
    <?php endif; ?>
</div><?php /**PATH /app/www/resources/views/books/parts/index-sidebar-section-new.blade.php ENDPATH**/ ?>