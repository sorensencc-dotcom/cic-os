<?php if($recents): ?>
    <div id="recents" class="mb-xl">
        <h5><?php echo e(trans('entities.recently_viewed')); ?></h5>
        <?php echo $__themeViews->handleViewInclude('entities.list', ['entities' => $recents, 'style' => 'compact'], array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1])); ?>
    </div>
<?php endif; ?><?php /**PATH /app/www/resources/views/books/parts/index-sidebar-section-recents.blade.php ENDPATH**/ ?>