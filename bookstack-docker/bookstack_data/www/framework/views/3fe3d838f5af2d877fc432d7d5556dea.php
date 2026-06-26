<div class="entity-list">
    <?php if(count($entities) > 0): ?>
        <?php $__currentLoopData = $entities; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $index => $entity): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>

            <?php echo $__themeViews->handleViewInclude('entities.list-item', [
                'entity' => $entity,
                'showPath' => true,
                'locked' => false,
            ], array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1])); ?>
        
            <?php if($index !== count($entities) - 1): ?>
                <hr>
            <?php endif; ?>

        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
    <?php else: ?>
        <div class="text-muted px-m py-m">
            <?php echo e(trans('common.no_items')); ?>

        </div>
    <?php endif; ?>
</div><?php /**PATH /app/www/resources/views/search/parts/entity-suggestion-list.blade.php ENDPATH**/ ?>